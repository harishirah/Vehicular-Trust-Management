import React from "react";

export default function Message({ user, createdAt, struct }) {
    return (
        <div className="message">
            <p>
                <span className="message__name">
                    {user.substr(0, 15) + "..."}
                </span>
                <span className="message__meta"> {createdAt}</span>
            </p>
            <p>{struct.message}</p>
        </div>
    );
}
