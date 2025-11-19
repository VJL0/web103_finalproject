export function getMe(req, res) {
  if (!req.user) {
    return res.status(200).json({ user: null });
  }
  res.json({ user: req.user });
}

export function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ success: true });
    });
  });
}
