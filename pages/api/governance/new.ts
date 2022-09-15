const handler = (req, res) => {
  if (req.method === "POST") {
    fetch("https://chain-of-good-default-rtdb.firebaseio.com/proposals.json", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.status(201).json({ message: "Proposal created" })
  } else {
    return res.status(400).json({ message: "Error" });
  }
};

export default handler;
