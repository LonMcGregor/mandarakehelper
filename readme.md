# mandarakehelper

Background worker:
* to keep track of what items you're tracking

Declarative net requests:
* Always rewrite lang=en to URLs because the site sometimes switches back to jp for some reason

Popup page:
* Summarises the items you're tracking in a table so you can find a common storefront to use
* Click the "item" field at the top left to see everything in a big tab

Content script:
* Add a button to track an item, and scrape page content


## updating branch
this branch has code that attempts to allow auto-updating.

unfortunately because there is no stable API for this I need to fake requests to a POST API endpoint. But this isn't allowed for CORS reasons, and trying to fake the request with header rewrite rules does not work.

TODO: figure this out?

If I can figure this out it would also let me add items from the search gallery without needing to open individual pages
