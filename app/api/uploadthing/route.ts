/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { createRouteHandlerClient } from "uploadthing/next"

import { ourFileRouter } from "./core"

export const { GET, POST } = createRouteHandlerClient({
  router: ourFileRouter,
})
