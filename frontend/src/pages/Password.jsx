import Layout from "../components/Layout";

export default function Password({
  passwords,
  onChange,
  onSubmit,
  submitting,
  message,
  onHome,
}) {
  return (
    <Layout password onHome={onHome}>
      <h1>Update password.</h1>
      <p className="sub">Choose a new password with at least six characters.</p>
      <form onSubmit={onSubmit}>
        <label className="field">
          Current password
          <input
            required
            name="oldPassword"
            type="password"
            value={passwords.oldPassword}
            onChange={onChange}
            autoComplete="current-password"
          />
        </label>
        <label className="field">
          New password
          <input
            required
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={onChange}
            minLength="6"
            autoComplete="new-password"
          />
        </label>
        <label className="field">
          Confirm new password
          <input
            required
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={onChange}
            minLength="6"
            autoComplete="new-password"
          />
        </label>
        <button className="primary" disabled={submitting}>
          {submitting ? "Updating password..." : "Update password"}
        </button>
      </form>
      {message}
      <p className="switch">
        <button className="link" onClick={onHome}>
          Back to home
        </button>
      </p>
    </Layout>
  );
}
