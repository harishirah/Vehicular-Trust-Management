import React from "react";
import IconButton from "@material-ui/core/IconButton";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import ThumbDownAltIcon from "@material-ui/icons/ThumbDownAlt";

export default function Message({
    idx,
    user,
    createdAt,
    struct,
    setTemp,
    updateResponse,
}) {
    return (
        <div className="message">
            <p>
                <span className="message__name">
                    {user.substr(0, 15) + "..."}
                </span>
                <span className="message__meta"> {createdAt}</span>
            </p>
            <p>{struct.message}</p>
            {struct && struct.status === 1 && (
                <div style={{ display: "flex", flex: 1 }}>
                    <IconButton
                        aria-label="cart"
                        onClick={() => {
                            updateResponse(idx, 1);
                            setTemp("fjldask");
                        }}
                    >
                        <ThumbUpAltIcon />
                    </IconButton>
                    <IconButton
                        aria-label="cart"
                        onClick={() => {
                            updateResponse(idx, 2);
                            setTemp("fjldask");
                        }}
                    >
                        <ThumbDownAltIcon />
                    </IconButton>
                </div>
            )}
        </div>
    );
}
