"""
Whiteboard routes - Weekly and general posts with threading
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from pathlib import Path
from datetime import datetime, timedelta

from ..utils.json_store import read_json_file, write_json_file, find_by_id, generate_sequential_id

whiteboard_bp = Blueprint('whiteboard', __name__, url_prefix='/api/whiteboards')

# Fixed user order for sorting
USER_ORDER = [
    "Naveen Anandakumar",
    "Aijan Sadyrova",
    "Lavinia Geraldo",
    "Kush Gunatra",
    "Maximilian Johnson",
    "Amgalan Battulga",
    "Cameron Thomas"
]


def get_week_boundaries(date=None):
    """
    Get the Monday and Sunday of the week containing the given date
    Returns (week_start, week_end) as ISO format strings
    """
    if date is None:
        date = datetime.now()
    elif isinstance(date, str):
        date = datetime.fromisoformat(date.replace('Z', '+00:00'))

    # Get Monday of this week (weekday 0 = Monday)
    days_since_monday = date.weekday()
    week_start = date - timedelta(days=days_since_monday)
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    # Get Sunday of this week
    week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)

    return week_start.isoformat(), week_end.isoformat()


def get_user_sort_index(full_name):
    """Get the sort index for a user based on USER_ORDER"""
    try:
        return USER_ORDER.index(full_name)
    except ValueError:
        return len(USER_ORDER)  # Put unknown users at the end


# ==================== WEEKLY WHITEBOARD ENDPOINTS ====================

@whiteboard_bp.route('/weekly', methods=['GET'])
@login_required
def get_weekly_posts():
    """
    Get all weekly whiteboard posts, organized by week
    Returns posts sorted by week (newest first), then by user order
    """
    try:
        weekly_path = Path(current_app.config['JSON_DIR']) / 'weekly_whiteboards.json'
        data = read_json_file(weekly_path)
        posts = data.get('posts', [])

        # Group posts by week
        weeks_dict = {}
        for post in posts:
            week_key = post['week_start']
            if week_key not in weeks_dict:
                weeks_dict[week_key] = {
                    'week_start': post['week_start'],
                    'week_end': post['week_end'],
                    'posts': []
                }
            weeks_dict[week_key]['posts'].append(post)

        # Sort posts within each week by user order
        for week_data in weeks_dict.values():
            week_data['posts'].sort(key=lambda p: get_user_sort_index(p['full_name']))

        # Convert to list and sort by week (newest first)
        weeks_list = list(weeks_dict.values())
        weeks_list.sort(key=lambda w: w['week_start'], reverse=True)

        return jsonify({
            "success": True,
            "data": weeks_list,
            "count": len(weeks_list)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading weekly posts: {str(e)}"
        }), 500


@whiteboard_bp.route('/weekly', methods=['POST'])
@login_required
def create_or_update_weekly_post():
    """
    Create or update a weekly post for this week
    Regular users: Only their own post
    Admins: Can create/update posts for any user by specifying user_id and full_name
    Only one post per user per week allowed
    """
    try:
        data = request.get_json()

        if not data.get('title') or not data.get('content'):
            return jsonify({
                "success": False,
                "message": "Title and content are required"
            }), 400

        # Determine the target user for this post
        # Admins can specify user_id and full_name to post on behalf of others
        if current_user.is_admin() and 'user_id' in data and 'full_name' in data:
            target_user_id = data['user_id']
            target_full_name = data['full_name']
        else:
            target_user_id = current_user.id
            target_full_name = current_user.full_name or current_user.username

        weekly_path = Path(current_app.config['JSON_DIR']) / 'weekly_whiteboards.json'
        file_data = read_json_file(weekly_path)
        posts = file_data.get('posts', [])

        # Get current week boundaries
        week_start, week_end = get_week_boundaries()

        # Check if user already has a post this week
        existing_post = None
        for post in posts:
            if (post['user_id'] == target_user_id and
                post['week_start'] == week_start):
                existing_post = post
                break

        if existing_post:
            # Update existing post
            existing_post['title'] = data['title']
            existing_post['content'] = data['content']
            existing_post['updated_at'] = datetime.now().isoformat()
            # Admin can update the full_name if provided
            if current_user.is_admin() and 'full_name' in data:
                existing_post['full_name'] = target_full_name
            updated_post = existing_post
        else:
            # Create new post
            new_post = {
                'id': generate_sequential_id(posts, 'id', 'weekly_'),
                'week_start': week_start,
                'week_end': week_end,
                'user_id': target_user_id,
                'full_name': target_full_name,
                'title': data['title'],
                'content': data['content'],
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            posts.append(new_post)
            updated_post = new_post

        file_data['posts'] = posts
        write_json_file(weekly_path, file_data)

        return jsonify({
            "success": True,
            "data": updated_post,
            "message": "Weekly post saved successfully"
        }), 200 if existing_post else 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error saving weekly post: {str(e)}"
        }), 500


@whiteboard_bp.route('/weekly/<post_id>', methods=['PUT'])
@login_required
def update_weekly_post(post_id):
    """
    Update a weekly post (owner or admin)
    Admins can optionally change the user attribution by providing user_id and full_name
    """
    try:
        data = request.get_json()

        weekly_path = Path(current_app.config['JSON_DIR']) / 'weekly_whiteboards.json'
        file_data = read_json_file(weekly_path)
        posts = file_data.get('posts', [])

        post = find_by_id(posts, 'id', post_id)
        if not post:
            return jsonify({
                "success": False,
                "message": "Post not found"
            }), 404

        # Check permission - only owner or admin can edit
        if post['user_id'] != current_user.id and not current_user.is_admin():
            return jsonify({
                "success": False,
                "message": "You can only edit your own posts"
            }), 403

        # Update fields
        if 'title' in data:
            post['title'] = data['title']
        if 'content' in data:
            post['content'] = data['content']

        # Admins can change the user attribution
        if current_user.is_admin():
            if 'user_id' in data:
                post['user_id'] = data['user_id']
            if 'full_name' in data:
                post['full_name'] = data['full_name']

        post['updated_at'] = datetime.now().isoformat()

        file_data['posts'] = posts
        write_json_file(weekly_path, file_data)

        return jsonify({
            "success": True,
            "data": post,
            "message": "Post updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating post: {str(e)}"
        }), 500


@whiteboard_bp.route('/weekly/<post_id>', methods=['DELETE'])
@login_required
def delete_weekly_post(post_id):
    """Delete a weekly post (owner or admin)"""
    try:
        weekly_path = Path(current_app.config['JSON_DIR']) / 'weekly_whiteboards.json'
        file_data = read_json_file(weekly_path)
        posts = file_data.get('posts', [])

        post = find_by_id(posts, 'id', post_id)
        if not post:
            return jsonify({
                "success": False,
                "message": "Post not found"
            }), 404

        # Check permission - only owner or admin can delete
        if post['user_id'] != current_user.id and not current_user.is_admin():
            return jsonify({
                "success": False,
                "message": "You can only delete your own posts"
            }), 403

        # Remove post
        posts = [p for p in posts if p['id'] != post_id]
        file_data['posts'] = posts
        write_json_file(weekly_path, file_data)

        return jsonify({
            "success": True,
            "message": "Post deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting post: {str(e)}"
        }), 500


# ==================== GENERAL POSTS ENDPOINTS ====================

@whiteboard_bp.route('/general', methods=['GET'])
@login_required
def get_general_posts():
    """
    Get all general posts, sorted by importance and date
    Important posts first, sorted by user order then date
    Non-important posts sorted by date (newest first)
    """
    try:
        general_path = Path(current_app.config['JSON_DIR']) / 'general_posts.json'
        data = read_json_file(general_path)
        posts = data.get('posts', [])

        # Separate important and non-important posts
        important_posts = [p for p in posts if p.get('is_important', False)]
        regular_posts = [p for p in posts if not p.get('is_important', False)]

        # Sort important posts: by user order, then by date (newest first)
        important_posts.sort(
            key=lambda p: (
                get_user_sort_index(p['full_name']),
                -datetime.fromisoformat(p['created_at'].replace('Z', '+00:00')).timestamp()
            )
        )

        # Sort regular posts: by date (newest first)
        regular_posts.sort(
            key=lambda p: datetime.fromisoformat(p['created_at'].replace('Z', '+00:00')).timestamp(),
            reverse=True
        )

        # Combine: important first, then regular
        sorted_posts = important_posts + regular_posts

        return jsonify({
            "success": True,
            "data": sorted_posts,
            "count": len(sorted_posts)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading general posts: {str(e)}"
        }), 500


@whiteboard_bp.route('/general', methods=['POST'])
@login_required
def create_general_post():
    """
    Create a new general post
    Regular users: Post as themselves
    Admins: Can post on behalf of any user by specifying user_id and full_name
    """
    try:
        data = request.get_json()

        if not data.get('title') or not data.get('content'):
            return jsonify({
                "success": False,
                "message": "Title and content are required"
            }), 400

        # Determine the target user for this post
        # Admins can specify user_id and full_name to post on behalf of others
        if current_user.is_admin() and 'user_id' in data and 'full_name' in data:
            target_user_id = data['user_id']
            target_full_name = data['full_name']
        else:
            target_user_id = current_user.id
            target_full_name = current_user.full_name or current_user.username

        general_path = Path(current_app.config['JSON_DIR']) / 'general_posts.json'
        file_data = read_json_file(general_path)
        posts = file_data.get('posts', [])

        new_post = {
            'id': generate_sequential_id(posts, 'id', 'post_'),
            'user_id': target_user_id,
            'full_name': target_full_name,
            'title': data['title'],
            'content': data['content'],
            'is_important': data.get('is_important', False),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'replies': []
        }

        posts.append(new_post)
        file_data['posts'] = posts
        write_json_file(general_path, file_data)

        return jsonify({
            "success": True,
            "data": new_post,
            "message": "Post created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating post: {str(e)}"
        }), 500


@whiteboard_bp.route('/general/<post_id>', methods=['PUT'])
@login_required
def update_general_post(post_id):
    """
    Update a general post (owner or admin)
    Admins can optionally change the user attribution by providing user_id and full_name
    """
    try:
        data = request.get_json()

        general_path = Path(current_app.config['JSON_DIR']) / 'general_posts.json'
        file_data = read_json_file(general_path)
        posts = file_data.get('posts', [])

        post = find_by_id(posts, 'id', post_id)
        if not post:
            return jsonify({
                "success": False,
                "message": "Post not found"
            }), 404

        # Check permission - only owner or admin can edit
        if post['user_id'] != current_user.id and not current_user.is_admin():
            return jsonify({
                "success": False,
                "message": "You can only edit your own posts"
            }), 403

        # Update fields
        if 'title' in data:
            post['title'] = data['title']
        if 'content' in data:
            post['content'] = data['content']
        if 'is_important' in data:
            post['is_important'] = data['is_important']

        # Admins can change the user attribution
        if current_user.is_admin():
            if 'user_id' in data:
                post['user_id'] = data['user_id']
            if 'full_name' in data:
                post['full_name'] = data['full_name']

        post['updated_at'] = datetime.now().isoformat()

        file_data['posts'] = posts
        write_json_file(general_path, file_data)

        return jsonify({
            "success": True,
            "data": post,
            "message": "Post updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating post: {str(e)}"
        }), 500


@whiteboard_bp.route('/general/<post_id>', methods=['DELETE'])
@login_required
def delete_general_post(post_id):
    """Delete a general post (owner or admin)"""
    try:
        general_path = Path(current_app.config['JSON_DIR']) / 'general_posts.json'
        file_data = read_json_file(general_path)
        posts = file_data.get('posts', [])

        post = find_by_id(posts, 'id', post_id)
        if not post:
            return jsonify({
                "success": False,
                "message": "Post not found"
            }), 404

        # Check permission - only owner or admin can delete
        if post['user_id'] != current_user.id and not current_user.is_admin():
            return jsonify({
                "success": False,
                "message": "You can only delete your own posts"
            }), 403

        # Remove post
        posts = [p for p in posts if p['id'] != post_id]
        file_data['posts'] = posts
        write_json_file(general_path, file_data)

        return jsonify({
            "success": True,
            "message": "Post deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting post: {str(e)}"
        }), 500


# ==================== REPLY/THREADING ENDPOINTS ====================

@whiteboard_bp.route('/general/<post_id>/reply', methods=['POST'])
@login_required
def add_reply(post_id):
    """Add a reply to a general post"""
    try:
        data = request.get_json()

        if not data.get('content'):
            return jsonify({
                "success": False,
                "message": "Reply content is required"
            }), 400

        general_path = Path(current_app.config['JSON_DIR']) / 'general_posts.json'
        file_data = read_json_file(general_path)
        posts = file_data.get('posts', [])

        post = find_by_id(posts, 'id', post_id)
        if not post:
            return jsonify({
                "success": False,
                "message": "Post not found"
            }), 404

        # Ensure replies array exists
        if 'replies' not in post:
            post['replies'] = []

        # Generate reply ID
        reply_id = f"reply_{len(post['replies']) + 1:03d}"

        new_reply = {
            'id': reply_id,
            'user_id': current_user.id,
            'full_name': current_user.full_name or current_user.username,
            'content': data['content'],
            'created_at': datetime.now().isoformat()
        }

        post['replies'].append(new_reply)
        file_data['posts'] = posts
        write_json_file(general_path, file_data)

        return jsonify({
            "success": True,
            "data": new_reply,
            "message": "Reply added successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error adding reply: {str(e)}"
        }), 500


@whiteboard_bp.route('/general/<post_id>/reply/<reply_id>', methods=['DELETE'])
@login_required
def delete_reply(post_id, reply_id):
    """Delete a reply (owner or admin)"""
    try:
        general_path = Path(current_app.config['JSON_DIR']) / 'general_posts.json'
        file_data = read_json_file(general_path)
        posts = file_data.get('posts', [])

        post = find_by_id(posts, 'id', post_id)
        if not post:
            return jsonify({
                "success": False,
                "message": "Post not found"
            }), 404

        # Find the reply
        reply = find_by_id(post.get('replies', []), 'id', reply_id)
        if not reply:
            return jsonify({
                "success": False,
                "message": "Reply not found"
            }), 404

        # Check permission - only owner or admin can delete
        if reply['user_id'] != current_user.id and not current_user.is_admin():
            return jsonify({
                "success": False,
                "message": "You can only delete your own replies"
            }), 403

        # Remove reply
        post['replies'] = [r for r in post['replies'] if r['id'] != reply_id]
        file_data['posts'] = posts
        write_json_file(general_path, file_data)

        return jsonify({
            "success": True,
            "message": "Reply deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting reply: {str(e)}"
        }), 500
