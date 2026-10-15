import Layout from "../components/Layout";

export default function Login({
  login,
  onChange,
  onSubmit,
  submitting,
  message,
  onRegister,
}) {
  return (
    <Layout onHome={() => {}}>
      <h1>Welcome back.</h1>
      <p className="sub">Sign in to discover your next favorite thing.</p>
      <form onSubmit={onSubmit}>
        <label className="field">
          Email address
          <input
            required
            name="email"
            type="email"
            value={login.email}
            onChange={onChange}
            autoComplete="email"
          />
        </label>
        <label className="field">
          Password
          <input
            required
            name="password"
            type="password"
            value={login.password}
            onChange={onChange}
            autoComplete="current-password"
          />
        </label>
        <button className="primary" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {message}
      <p className="switch">
        New to ShopKart?{" "}
        <button className="link" onClick={onRegister}>
          Create an account
        </button>
      </p>
    </Layout>
  );
}
