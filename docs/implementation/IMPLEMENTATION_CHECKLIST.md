# Liquidity Restructure - Implementation Checklist

## Pre-Implementation

### Decision Points
- [ ] Approve three-tier data model (Partner → Team → Contact)
- [ ] Approve Meeting Notes page design
- [ ] Confirm investment min/max should be per team
- [ ] Confirm preferences should be per team
- [ ] Decide on currency support (USD only vs. multi-currency)
- [ ] Decide on additional fields needed (if any)

### Preparation
- [ ] Backup entire `data/json/` directory
- [ ] Backup entire codebase
- [ ] Review current `institutions.json` data
- [ ] Count: How many capital partners exist?
- [ ] Estimate: How many teams will be created initially?
- [ ] Test on development environment first

---

## Phase 1: Data Migration & Backend (Week 1)

### Migration Script
- [ ] Create `scripts/migrate_to_new_structure.py`
- [ ] Script reads `institutions.json`
- [ ] Script creates `capital_partners.json`
- [ ] Script creates `teams.json` with "Main Team" for each partner
- [ ] Script creates empty/minimal `contacts.json`
- [ ] Script generates unique IDs (cp_001, team_001, contact_001, etc.)
- [ ] Script preserves ALL existing preference data
- [ ] Script creates backup files (`.backup` extension)
- [ ] Test migration on copy of data
- [ ] Verify all data preserved correctly
- [ ] Run migration on production data

### Backend API - Capital Partners
- [ ] Add `GET /api/capital-partners`
- [ ] Add `GET /api/capital-partners/:id`
- [ ] Add `POST /api/capital-partners`
- [ ] Add `PUT /api/capital-partners/:id`
- [ ] Add `DELETE /api/capital-partners/:id` (with cascade logic)
- [ ] Test all endpoints with Postman/curl

### Backend API - Teams
- [ ] Add `GET /api/teams`
- [ ] Add `GET /api/teams?capital_partner_id=X`
- [ ] Add `GET /api/teams/:id`
- [ ] Add `POST /api/teams`
- [ ] Add `PUT /api/teams/:id`
- [ ] Add `DELETE /api/teams/:id` (with cascade logic)
- [ ] Test all endpoints

### Backend API - Contacts (Updated)
- [ ] Update `GET /api/contacts` to use new structure
- [ ] Add `GET /api/contacts?team_id=X`
- [ ] Add `GET /api/contacts?capital_partner_id=X`
- [ ] Update `GET /api/contacts/:id`
- [ ] Update `POST /api/contacts`
- [ ] Update `PUT /api/contacts/:id`
- [ ] Update `DELETE /api/contacts/:id`
- [ ] Test all endpoints

### Backend API - Meeting Notes
- [ ] Add `POST /api/meeting-notes`
  - [ ] Updates contact info
  - [ ] Updates team info
  - [ ] Adds to meeting history
  - [ ] Sets next follow-up reminder
  - [ ] Single transaction (rollback on error)
- [ ] Add `GET /api/meeting-notes/reminders`
  - [ ] Returns contacts with upcoming follow-ups
  - [ ] Sorts by date
- [ ] Test combined updates
- [ ] Test transaction rollback

### Backend API - Legacy Compatibility
- [ ] Keep `GET /api/institutions` (flatten partners + teams)
- [ ] Keep `POST /api/institutions/save` (backwards compatible)
- [ ] Add deprecation notices to legacy endpoints
- [ ] Test existing pages still work

### Backend Testing
- [ ] Test cascade deletes (partner → teams → contacts)
- [ ] Test validation (team must have valid partner_id)
- [ ] Test validation (contact must have valid team_id)
- [ ] Test JSON backup creation
- [ ] Test error handling
- [ ] Load test with realistic data volume

---

## Phase 2: Capital Partners & Teams UI (Week 2)

### Capital Partners List Page
- [ ] Create `web/src/pages/liquidity/CapitalPartnersList.tsx`
- [ ] Display all partners in cards/table
- [ ] Show: name, type, country, relationship
- [ ] Add search/filter functionality
- [ ] Add "New Partner" button
- [ ] Add edit/delete actions per partner
- [ ] Test CRUD operations

### Capital Partner Form
- [ ] Create `web/src/components/liquidity/CapitalPartnerForm.tsx`
- [ ] Fields: name, type, country, headquarters, relationship, notes
- [ ] Validation: required fields
- [ ] Show teams count (if editing existing)
- [ ] Warn if deleting (cascade warning)
- [ ] Test create/edit/delete

### Teams List Page
- [ ] Create `web/src/pages/liquidity/TeamsList.tsx`
- [ ] Display teams grouped by capital partner
- [ ] Show: team name, office, investment range, contacts count
- [ ] Add "New Team" button
- [ ] Add edit/delete actions per team
- [ ] Filter by capital partner
- [ ] Test CRUD operations

### Team Form/Detail Page
- [ ] Create `web/src/pages/liquidity/TeamDetail.tsx`
- [ ] Show team info section
- [ ] Show investment min/max (editable)
- [ ] Show office location (editable)
- [ ] Show preferences grid (all Y/N toggles)
- [ ] Group preferences into sections (collapsible)
- [ ] Show contacts in this team (table)
- [ ] Add "Add Contact to Team" button
- [ ] Test saving preferences
- [ ] Test investment amount validation (min < max)

### Update Damn Effect Strategy Edit Page
- [ ] Modify `DamnEffectStrategyEdit.tsx` to use new API
- [ ] Map capital partners + teams to flattened view
- [ ] Update to show team-level preferences
- [ ] Add indicator when partner has multiple teams
- [ ] Test compatibility

### Routing
- [ ] Add route `/liquidity/capital-partners`
- [ ] Add route `/liquidity/capital-partners/new`
- [ ] Add route `/liquidity/capital-partners/:id`
- [ ] Add route `/liquidity/teams`
- [ ] Add route `/liquidity/teams/new`
- [ ] Add route `/liquidity/teams/:id`
- [ ] Update Liquidity landing page links

---

## Phase 3: Contacts Restructure (Week 3)

### Update Contacts List Page
- [ ] Modify `ContactsUnifiedPage.tsx`
- [ ] Show hierarchy: Partner > Team > Contact
- [ ] Group contacts by partner, then by team
- [ ] Show team name under each contact
- [ ] Update filter to filter by team
- [ ] Add "Add Contact" button (select team)
- [ ] Test viewing grouped contacts

### Update Contact Form
- [ ] Modify `ContactForm.tsx`
- [ ] Replace "Capital Partner" dropdown with "Team" dropdown
- [ ] Team dropdown grouped by capital partner
- [ ] Show selected team's capital partner (readonly)
- [ ] Add phone, LinkedIn fields
- [ ] Add DISC profile dropdown
- [ ] Add relationship strength dropdown
- [ ] Test creating contact under team
- [ ] Test validation

### Contact Detail View
- [ ] Create `web/src/pages/liquidity/ContactDetail.tsx`
- [ ] Show breadcrumb: Partner > Team > Contact
- [ ] Show contact personal info
- [ ] Show team info (readonly, link to edit)
- [ ] Show meeting history timeline
- [ ] Show next follow-up reminder
- [ ] Add "Start Meeting" button (→ Meeting Notes page)
- [ ] Add "Edit Contact" button
- [ ] Test navigation

### TypeScript Types
- [ ] Create `web/src/types/liquidity.ts`
- [ ] Define `CapitalPartner` interface
- [ ] Define `Team` interface
- [ ] Define `Contact` interface
- [ ] Define `MeetingHistoryEntry` interface
- [ ] Define `InvestmentPreferences` interface
- [ ] Use strict typing throughout

### Routing
- [ ] Update route `/liquidity/contacts` (existing)
- [ ] Add route `/liquidity/contacts/new`
- [ ] Add route `/liquidity/contacts/:id`
- [ ] Add route `/liquidity/contacts/:id/edit`

---

## Phase 4: Meeting Notes Feature (Week 4)

### Meeting Notes Selection Page
- [ ] Create `web/src/pages/liquidity/MeetingNotesSelect.tsx`
- [ ] List all contacts (grouped by partner)
- [ ] Search/filter contacts
- [ ] "Start Meeting" button per contact
- [ ] Show last contact date
- [ ] Show next follow-up date
- [ ] Highlight contacts due for follow-up (today or overdue)

### Meeting Notes Editor Page
- [ ] Create `web/src/pages/liquidity/MeetingNotesPage.tsx`
- [ ] Load contact, team, and capital partner data
- [ ] Section 1: Contact info (editable fields)
- [ ] Section 2: Team investment params (editable)
- [ ] Section 3: Team preferences grid (Y/N toggles, collapsible)
- [ ] Section 4: Today's meeting notes (text area)
- [ ] Section 5: Meeting history (readonly, collapsible)
- [ ] Section 6: Next follow-up date picker
- [ ] Implement auto-save draft (every 30 seconds)
- [ ] Show "unsaved changes" indicator
- [ ] Validate required fields
- [ ] Validate investment min < max
- [ ] Handle save button click
- [ ] Show success message with changes summary
- [ ] Show error messages if save fails

### Meeting Notes API Integration
- [ ] Create `POST /api/meeting-notes` request
- [ ] Send combined payload: contact + team updates
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Handle success states
- [ ] Test rollback on partial failure

### Preferences Grid Component
- [ ] Create `web/src/components/liquidity/PreferencesGrid.tsx`
- [ ] Reusable Y/N toggle grid
- [ ] Group preferences into collapsible sections
- [ ] Highlight changed values
- [ ] Props: preferences, onChange, readonly
- [ ] Use in both Team Detail and Meeting Notes pages

### Date/Time Components
- [ ] Add date picker for follow-up
- [ ] Show "days until" follow-up
- [ ] Suggest common intervals (1w, 2w, 1m, 3m)
- [ ] Format dates consistently throughout

### Routing
- [ ] Add route `/liquidity/meeting-notes`
- [ ] Add route `/liquidity/meeting-notes/:contact_id`

---

## Phase 5: Liquidity Landing Page Updates (Week 4)

### Contact Reminders Widget
- [ ] Create `web/src/components/liquidity/ContactReminders.tsx`
- [ ] Fetch contacts with upcoming follow-ups
- [ ] Show contacts due today (highlighted)
- [ ] Show contacts due this week
- [ ] Show overdue contacts (red highlight)
- [ ] Sort by date (soonest first)
- [ ] Click to open Meeting Notes page
- [ ] "Dismiss" or "Snooze" options

### Recent Meetings Widget
- [ ] Create `web/src/components/liquidity/RecentMeetings.tsx`
- [ ] Show last 5-10 meetings across all contacts
- [ ] Display: contact name, date, brief note excerpt
- [ ] Click to view full contact detail
- [ ] Test display

### Quick Actions
- [ ] Update action cards on LiquidityPage
- [ ] "Start Meeting" → Select contact
- [ ] "Add Contact" → New contact form
- [ ] "Add Capital Partner" → New partner form
- [ ] "View Teams" → Teams list
- [ ] "Saved Filters" → Existing page

### Dashboard Stats (Optional)
- [ ] Total capital partners count
- [ ] Total teams count
- [ ] Total contacts count
- [ ] Meetings this month count
- [ ] Upcoming follow-ups count

---

## Phase 6: Testing & Refinement (Week 5)

### Unit Testing
- [ ] Test API endpoints (all CRUD operations)
- [ ] Test cascade deletes
- [ ] Test data validation
- [ ] Test error handling
- [ ] Test transaction rollbacks

### Integration Testing
- [ ] Test complete user flows:
  - [ ] Add capital partner → Add team → Add contact
  - [ ] Conduct meeting → Update preferences → Schedule follow-up
  - [ ] Edit team → Verify contacts unchanged
  - [ ] Delete team → Verify contacts deleted
  - [ ] Delete partner → Verify teams & contacts deleted

### UI/UX Testing
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test keyboard navigation
- [ ] Test screen reader accessibility
- [ ] Test loading states
- [ ] Test error states
- [ ] Test success states
- [ ] Test with realistic data volume

### Data Validation
- [ ] Verify all migrated data is correct
- [ ] Verify no data loss
- [ ] Verify all relationships intact
- [ ] Test on production copy before deployment

### Performance Testing
- [ ] Load test with 100+ capital partners
- [ ] Load test with 500+ teams
- [ ] Load test with 1000+ contacts
- [ ] Optimize slow queries
- [ ] Add pagination if needed

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Bug Fixes
- [ ] Fix any bugs found during testing
- [ ] Address any UX issues
- [ ] Refine UI based on feedback

---

## Phase 7: Documentation & Training

### Technical Documentation
- [ ] Update CLAUDE.md with new structure
- [ ] Document API endpoints
- [ ] Document data model
- [ ] Add code comments
- [ ] Create API documentation (Swagger/OpenAPI)

### User Documentation
- [ ] Create user guide for Meeting Notes page
- [ ] Create guide for managing capital partners
- [ ] Create guide for managing teams
- [ ] Create guide for setting up contacts
- [ ] Add screenshots/screencasts

### Training
- [ ] Train users on new structure
- [ ] Explain Partner → Team → Contact hierarchy
- [ ] Demo Meeting Notes workflow
- [ ] Demo contact reminders
- [ ] Answer questions

---

## Phase 8: Deployment

### Pre-Deployment
- [ ] Final backup of all data
- [ ] Final backup of codebase
- [ ] Test migration script one more time
- [ ] Review checklist completion

### Deployment
- [ ] Run migration script on production data
- [ ] Verify migration success
- [ ] Deploy backend API changes
- [ ] Deploy frontend changes
- [ ] Test in production environment
- [ ] Monitor for errors

### Post-Deployment
- [ ] Monitor API logs for errors
- [ ] Monitor user feedback
- [ ] Fix any critical issues immediately
- [ ] Schedule follow-up review (1 week later)

### Rollback Plan (If Needed)
- [ ] Restore backup data files
- [ ] Restore backup codebase
- [ ] Keep legacy endpoints active during transition
- [ ] Document lessons learned

---

## Optional Enhancements (Future)

### Short-term (1-2 months)
- [ ] Email reminders for follow-ups
- [ ] Calendar integration
- [ ] Export contacts to CSV
- [ ] Import contacts from CSV
- [ ] Bulk edit preferences
- [ ] Advanced search/filtering

### Medium-term (3-6 months)
- [ ] Deal tracking linked to contacts
- [ ] Pipeline management
- [ ] Document attachments per meeting
- [ ] Team permission levels (view vs. edit)
- [ ] Audit log (who changed what, when)

### Long-term (6+ months)
- [ ] AI meeting notes summary
- [ ] Voice-to-text meeting notes
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Mobile app
- [ ] Real-time collaboration (multiple users in meeting)
- [ ] Analytics dashboard (meeting frequency, conversion rates)

---

## Success Metrics

### Quantitative
- [ ] Zero data loss during migration
- [ ] All existing capital partners migrated successfully
- [ ] API response time < 200ms for most endpoints
- [ ] Page load time < 2 seconds
- [ ] Zero critical bugs in production

### Qualitative
- [ ] Users can easily understand the hierarchy
- [ ] Meeting Notes page saves time during calls
- [ ] Contact reminders improve follow-up rates
- [ ] System accurately reflects real-world structure
- [ ] Users prefer new system over old flat structure

---

## Sign-off

- [ ] Technical lead approves architecture
- [ ] Product owner approves features
- [ ] Users approve UI/UX
- [ ] Data validated and correct
- [ ] Testing complete
- [ ] Documentation complete
- [ ] Ready for production deployment

**Deployment Date**: ________________

**Deployed By**: ____________________

**Sign-off**: ________________________
