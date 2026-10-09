import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PrivateRoute, AdminRoute, GuestRoute } from './Guards';

// Pages
import { Home } from '../pages/store/Home';
import { GameDetails } from '../pages/store/GameDetails';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Checkout } from '../pages/checkout/Checkout';
import { Library } from '../pages/library/Library';
import { Orders } from '../pages/orders/Orders';
import { Profile } from '../pages/profile/Profile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminGames } from '../pages/admin/AdminGames';
import { AdminCategories } from '../pages/admin/AdminCategories';
import { AdminUsers } from '../pages/admin/AdminUsers';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/games/:id" element={<GameDetails />} />

        {/* Guest Routes (Login / Register) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/library" element={<Library />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/games" element={<AdminGames />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
