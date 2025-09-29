import type { LithiaRequest, LithiaResponse } from "lithia";

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  console.log("Health route");
  res.send("Hello from your new route!");
}
