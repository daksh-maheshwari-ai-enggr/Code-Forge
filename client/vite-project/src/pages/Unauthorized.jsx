function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p>You are not authorized to access this page.</p>
      </div>
    </div>
  );
}

export default Unauthorized;