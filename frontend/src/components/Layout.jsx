import Brand from "./Brand";
import ThemePicker from "./ThemePicker";

function Artwork({ password }) {
  return (
    <aside className="art">
      <div className="art-content">
        <span className="tag">
          {password ? "Account security" : "Shop with ease"}
        </span>
        <h2>
          {password
            ? "Keep your account secure."
            : "Good things, thoughtfully found."}
        </h2>
        <p>
          {password
            ? "Confirm your current password before setting a new one."
            : "A simple place for everyday essentials and little delights."}
        </p>
      </div>
    </aside>
  );
}

export default function Layout({ children, password, onHome }) {
  return (
    <main className="auth">
      <section className="panel">
        <header className="auth-header">
          <Brand onClick={onHome} />
          <ThemePicker />
        </header>
        <div className="auth-body">
          <div className="copy">{children}</div>
        </div>
      </section>
      <Artwork password={password} />
    </main>
  );
}
