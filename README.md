# Slack FOIA Search
Search a slack data export to satisfy a FOIA request

### Overview

At the Slack Business+ pricing tier, administrators can download an export of Slack messages within a timeframe. This repo will house one or more scripts for doing searches of an export to satisfy a FOIA request, which is a concern for government agencies.

### Usage

To search user messages by user id, use the following command:

```sh
node user-messages.js EXPORT_FOLDER_PATH USER_ID
```

Note: you will need to look at the `users.json` file in the export to determine the ID of a user to search for.

This script currently produces output like:

```txt
Discussion: Anna Jones, Tom Smith
6/2/2021 10:54:18 AM
Anna Jones: GoTo is better for me! Can you throw something on my calendar?


Discussion: Anna Jones, Tom Smith
6/2/2021 10:56:45 AM
Tom Smith: Sent!


Channel: general
6/2/2021 10:58:44 AM
Tom Smith: Hi everyone, my name is Tom.
```
