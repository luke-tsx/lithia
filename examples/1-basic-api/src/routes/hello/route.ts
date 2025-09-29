import type { LithiaRequest, LithiaResponse } from "lithia";

export default async function handler(_: LithiaRequest, res: LithiaResponse) {
  res.send("Hello, from Lithia! 🚀");
}
