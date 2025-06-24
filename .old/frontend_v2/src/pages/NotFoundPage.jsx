import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="page-container text-center w-full max-w-md">
        <div>
          <h1 className="text-8xl sm:text-9xl font-extrabold text-indigo-400">
            404
          </h1>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold">
            Oops! Page Not Found.
          </h2>
          <p className="mt-3 text-base text-gray-400">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
            Don't worry, let's get you back on track!
          </p>
        </div>
        <div className="mt-8">
          <RouterLink
            to="/"
            className="gradient-button inline-flex items-center justify-center"
          >
            Go to Homepage
          </RouterLink>
        </div>
        <div className="mt-10">
            <img
                src="/undraw_page_not_found_re_e9o6.svg"
                alt="Page Not Found Illustration"
                className="mx-auto w-full max-w-xs sm:max-w-sm h-auto"
            />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
