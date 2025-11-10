#!/usr/bin/env python3
"""
Clean up workstream categories by splitting mission_goal prefixes
"""
import json
import re
from pathlib import Path
from datetime import datetime

# Classifier mappings
CLASSIFIER_LABELS = {
    'A': 'Personal Research',
    'B': 'Transactions',
    'C': 'Research',
    'D': 'Market Intelligence',
    'O': 'Other',
    'E': 'External'
}

def clean_workstreams():
    """Clean workstream data by splitting mission_goal prefixes"""

    # Path to workstreams JSON
    base_dir = Path(__file__).parent.parent
    workstreams_path = base_dir / 'backend' / 'data' / 'json' / 'playbook_workstreams.json'

    if not workstreams_path.exists():
        print(f"ERROR: File not found: {workstreams_path}")
        return

    # Create backup
    backup_path = workstreams_path.with_suffix(f'.json.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
    with open(workstreams_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[OK] Created backup: {backup_path}")

    # Process each workstream
    updated_count = 0
    for workstream in data:
        mission_goal = workstream.get('mission_goal', '')

        # Try to match pattern like "O1 Onboarding", "C1 Global Infra..."
        match = re.match(r'^([A-Z])(\d+)\s+(.+)$', mission_goal)

        if match:
            classifier_letter = match.group(1)
            number = match.group(2)
            actual_goal = match.group(3)

            # Update fields
            old_mission_goal = workstream['mission_goal']
            workstream['mission_goal'] = actual_goal
            workstream['key'] = classifier_letter
            workstream['description'] = CLASSIFIER_LABELS.get(classifier_letter, '')

            # Clear category field (repurpose for additional notes)
            if workstream.get('category') in ['Intelligence and Research', 'Organisation', 'Uzbekistan Intelligence', '-']:
                workstream['category'] = ''

            print(f"[OK] Updated: {old_mission_goal} -> {classifier_letter} | {actual_goal}")
            updated_count += 1
        else:
            print(f"[SKIP] Skipped (no prefix): {mission_goal}")

    # Write updated data
    with open(workstreams_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Updated {updated_count} workstreams")
    print(f"[OK] Saved to: {workstreams_path}")

if __name__ == '__main__':
    clean_workstreams()
