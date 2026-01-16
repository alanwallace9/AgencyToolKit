# Phase 3: Onboarding Tours - Backlog

Ideas and features to add after the core tour features (18-22) are complete.

## Future Feature Ideas

### Share/Affiliate Links
- Agencies can share tours they've built with other agencies
- Shared link allows recipient to sign up and use the tour (limited uses)
- Tracks who shared, enabling affiliate-style referral system
- Natural growth mechanic for Agency Toolkit

### Tour Analytics Dashboard
- Advanced funnel visualization
- Step-by-step drop-off analysis
- A/B testing for tour variations
- Heatmaps for where users exit

### AI Content Generation
- "Generate step content" button
- AI suggests tour content based on page/element context
- Auto-suggest optimal step count

### Tour Scheduling
- Schedule tours to go live at specific dates
- Auto-expire tours after end date
- Seasonal/promotional tour campaigns

### Conditional Logic
- Show different steps based on user attributes
- Branch tours based on user choices
- Skip steps if conditions aren't met

### Multi-language Support
- Translate tour content
- Auto-detect user language
- Language-specific tours

### Import/Export
- Export tours as JSON
- Import tours from other accounts
- Tour marketplace (share templates publicly)

### Advanced Triggers
- Trigger on scroll position
- Trigger on time spent on page
- Trigger on rage clicks / confusion detection
- Trigger on exit intent

### Prerequisite-Based Tour Triggers
- **Problem**: User tries to use a feature before completing required setup
- **Solution**: Auto-trigger a "setup first" tour when prerequisites aren't met
- **Example Use Cases**:
  - User clicks "Select Element" but hasn't embedded the script → Show "Embed Your Script First" tour
  - User tries to publish a tour but has no customers → Show "Add Your First Customer" tour
  - User visits dashboard but hasn't configured GHL domain → Show "Connect Your GHL Account" tour
- **Implementation Needs**:
  - Define prerequisite conditions per tour (e.g., `embed_script_installed: false`)
  - Detection logic to check conditions (API calls, element detection, localStorage)
  - Trigger rules: "When user does X AND condition Y is met, show tour Z"
  - Priority system if multiple tours could trigger

### Smart Step Completion Detection (Auto-Resume)
- **Problem**: User starts a multi-step tour, completes some steps, leaves, returns later
- **Solution**: Tour detects which steps are already complete and resumes from the right point
- **Example Use Case**:
  - Step 1: Connect Google Account (completion: `.google-connected-badge` exists)
  - Step 2: Connect CRM (completion: `#crm-status.active` exists)
  - User completes Step 1, gets distracted, returns next day
  - Tour auto-detects Google is connected, starts at Step 2
- **Completion Criteria Types**:
  - Element exists on page (CSS selector)
  - Element has specific text/attribute
  - localStorage/sessionStorage value exists
  - API endpoint returns specific data
  - Custom JavaScript expression evaluates to true
- **Implementation Needs**:
  - Per-step `completionCheck` field in step schema
  - On tour start: evaluate all steps, find first incomplete
  - Option to show "You've already completed X steps" message
  - Handle edge cases (step was completed but user undid it)

### Interactive Elements in Steps
- Embedded forms in tour steps
- Quick polls / NPS in tours
- Input validation before next step

### Live Builder Mode (V2 Element Selector)
- **Current (V1)**: Element picker - select one element at a time, return to dashboard
- **Future (V2)**: Stay in GHL with builder toolbar, add steps as you navigate
- User opens GHL with builder mode banner
- Navigate to any subaccount, browse pages naturally
- Click elements to add tour steps without leaving GHL
- Floating step editor panel shows in corner
- Tour builds in real-time in the dashboard
- Much better UX but significantly more complex to implement

### Saved Element Library
- Save frequently-used selectors with friendly names
- "Contacts Button", "Dashboard Tab", "Settings Gear"
- Quick-pick from library instead of re-selecting
- Share element library across tours

---

*Add new ideas here as they come up during development.*
