import { Link, Outlet } from '@tanstack/react-router';

export default function RootLayout() {
  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/goals" className="[&.active]:font-bold">
          Goals
        </Link>{' '}
      </div>
      <hr />
      <Outlet />
    </>
  );
}
