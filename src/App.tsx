import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import BlogList from './pages/BlogList';
import CreateBlog from './pages/CreateBlog';
import ViewBlog from './pages/ViewBlog';
import UpdateBlog from './pages/UpdateBlog';
import MyPostsPage from './pages/MyPostsPage';

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        {/* Public Routes */}
                        <Route path="/" element={<BlogList />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/blog/:id" element={<ViewBlog />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/create-blog" element={<CreateBlog />} />
                            <Route path="/blog/edit/:id" element={<UpdateBlog />} />
                            <Route path="/my-posts" element={<MyPostsPage />} />
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
