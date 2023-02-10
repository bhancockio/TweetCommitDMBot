import { type NextApiRequest, type NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    console.log(req.body);
    const milestoneId = req.body as string | undefined;

    if (!milestoneId) {
      return res.status(400).json({ body: "Invalid request type" });
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return fetch(`${process.env.AWS_BASE_URL}/milestone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(milestoneId),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        return res.status(200).json(data);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json(err);
      });
  } else {
    return res.status(400).json({ body: "Invalid request type" });
  }
}
