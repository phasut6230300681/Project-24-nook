import { useEffect, useState } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';

const clientId = "902199029700-1pv3edc1p4oqe8kj2k77ltqapea1ooa2.apps.googleusercontent.com";

export default function GoogleButton({ setFormData, handleLogin }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const initializeGoogleApi = async () => {
            try {
                await gapi.load("client:auth2");
                await gapi.client.init({
                    clientId: clientId,
                    scope: ''
                });
                console.log('Google API initialized successfully');
            } catch (error) {
                console.error('Error initializing Google API:', error);
            }
        };

        initializeGoogleApi();
    }, []);

    const handleGoogleLoginSuccess = (res) => {
        const { email, imageUrl } = res.profileObj;
        setProfile(res.profileObj);
        setFormData(prevFormData => ({
            ...prevFormData,
            email: email
        }));
        localStorage.setItem('userData', JSON.stringify({ imageUrl }));
        handleLogin();
    };

    const handleGoogleLoginFailure = (res) => {
        if (res.error !== "Cross-Origin-Opener-Policy") {
            console.error('Google login failure:', res);
        }
    };

    return (
        <div className='flex flex-col items-center border border-solid border-black rounded-tl-lg rounded-tr-lg px-12 pt-3 pb-6 bg-emerald-600'>
            <h1 className='font-bold text-white'>For Professor</h1>
            {profile ? (
                <GoogleLogout clientId={clientId} buttonText='Log out' onLogoutSuccess={() => setProfile(null)} />
            ) : (
                <GoogleLogin
                    clientId={clientId}
                    buttonText='Sign in with Google'
                    onSuccess={handleGoogleLoginSuccess}
                    onFailure={handleGoogleLoginFailure}
                    isSignedIn={false}
                />
            )}
        </div>
    );
}
