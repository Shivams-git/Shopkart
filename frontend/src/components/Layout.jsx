import Brand from "./Brand";

function Artwork({ password }) {
  return (
    <aside className="art">
      <div>
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
        <Brand onClick={onHome} />
        <div className="copy">{children}</div>
      </section>
      <Artwork password={password} />
    </main>
  );
}
