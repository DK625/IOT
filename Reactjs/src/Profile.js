/* eslint-disable */
import React from 'react';
import './Profile.scss'; // Import file CSS để tùy chỉnh giao diện
import avatar10 from './assets/images/avatars/10.jpg'

const Profile = () => {
    return (
        <div className="profile">
            <div className="profile-header">
                {/* <img src="https://via.placeholder.com/150" alt="Avatar" className="avatar" /> */}
                <img src={avatar10} alt="Avatar" className="avatar" />
                {/* <CAvatar src={avatar10} size="md" /> */}
                <h1 className="profile-title">Dora King</h1>
                <p className="profile-subtitle">Web Developer</p>
            </div>
            <div className="profile-content">
                <h2>About Me</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sit amet libero nec elit malesuada interdum.</p>
                <h2>My Skills</h2>
                <ul className="skill-list">
                    <li>HTML</li>
                    <li>CSS</li>
                    <li>JavaScript</li>
                    <li>React</li>
                </ul>
                <h2>Contact</h2>
                <p>Email: johndoe@example.com</p>
                <p>Phone: (123) 456-7890</p>
            </div>
        </div>
    );
};

export default Profile;
