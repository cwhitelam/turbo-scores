import React from 'react';
import ErrorBoundaryExample from '../components/ErrorBoundaryTest';
import { useErrorContext } from '../context/ErrorContext';

const ErrorBoundaryTestPage: React.FC = () => {
    const { errors } = useErrorContext();

    return (
        <div className="error-boundary-test-page">
            <h1>Error Boundary Testing</h1>

            <section className="current-errors">
                <h2>Current Error List from Context</h2>
                {errors.length === 0 ? (
                    <p>No errors have been reported yet</p>
                ) : (
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>
                                <strong>{error.message}</strong>
                                <pre>{error.stack}</pre>
                                <p>Reported at: {new Date(error.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="examples">
                <ErrorBoundaryExample />
            </section>
        </div>
    );
};

export default ErrorBoundaryTestPage; 