export default function PageContent({ children }) {
  return (
    <div
      className="page-content"
      style={{
        minHeight: "100vh",
        // backgroundImage: `url(${backgroundImage})`,
        // backgroundSize: "contain",
        // backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}
