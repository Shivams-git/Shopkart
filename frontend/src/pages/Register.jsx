import Layout from "../components/Layout";

export default function Register({
  register,
  onChange,
  onSubmit,
  submitting,
  message,
  onLogin,
}) {
  return (
    <Layout onHome={onLogin}>
      <h1>Create your account.</h1>
      <p className="sub">A few details and you are ready to shop.</p>
      <form onSubmit={onSubmit}>
        <label className="field">
          Full name
          <input
            required
            name="fullName"
            value={register.fullName}
            onChange={onChange}
            autoComplete="name"
          />
        </label>
        <label className="field">
          Email address
          <input
            required
            name="email"
            type="email"
            value={register.email}
            onChange={onChange}
            autoComplete="email"
          />
        </label>
        <label className="field">
          Phone number
          <input
            required
            name="phone"
            type="tel"
            value={register.phone}
            onChange={onChange}
            autoComplete="tel"
          />
        </label>
        <label className="field">
          Password
          <input
            required
            name="password"
            type="password"
            value={register.password}
            onChange={onChange}
            minLength="6"
            autoComplete="new-password"
          />
        </label>
        <button className="primary" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      {message}
      <p className="switch">
        Already have an account?{" "}
        <button className="link" onClick={onLogin}>
          Sign in
        </button>
      </p>
    </Layout>
  );
}
