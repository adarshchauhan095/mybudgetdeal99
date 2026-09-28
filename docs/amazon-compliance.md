# Amazon Associates Compliance Guide

## 1. Core Operating Principles
MyBudgetDeal99 is structured strictly in adherence to the **Amazon Associates Program Operating Agreement** and Policies.

---

## 2. Mandatory Disclosures Implemented

### A. Global Site Disclosure
Present in the global site footer across every page:
> *"As an Amazon Associate I earn from qualifying purchases."*

### B. Product & Collection Page Disclosures
Displayed prominently near every affiliate CTA button:
> *"Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product."*

### C. Dedicated Affiliate Disclosure Page
Located at `/affiliate-disclosure`, explaining:
- Full affiliate relationship.
- Editorial independence.
- No direct checkout or transaction handling on this website.
- Redirection to Amazon via Special Links.

---

## 3. Strict Prohibitions Enforced in the Codebase

1. **No HTML Scraping**: Amazon HTML pages are not scraped or parsed directly to avoid violating Amazon Terms of Service.
2. **No Fake Urgency / Artificial Scarcity**: No fabricated countdown timers, false purchase counters, or fake user reviews.
3. **No Automatic Redirection**: The site never silently redirects users to Amazon. The user must deliberately click an explicit *"View on Amazon"* button.
4. **Transparent Outbound Links**:
   - Outbound URLs contain the legitimate partner tag `tag=mybudgetdeal99-21`.
   - Links include `rel="nofollow noopener sponsored"` and open in a new tab (`target="_blank"`).
5. **No Trademark Infringement**: The website avoids using Amazon's proprietary branding, logos, or copying Amazon's proprietary checkout interface.
6. **Editorial Separation**: Editorial buying advice and setup checklists are distinct and separate from Amazon product specs.
