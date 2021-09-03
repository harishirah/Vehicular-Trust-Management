import React from "react";
import Badge from "@material-ui/core/Badge";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import ThumbDownAltIcon from "@material-ui/icons/ThumbDownAlt";

const StyledBadge = withStyles((theme) => ({
	badge: {
		right: -3,
		top: 13,
		border: `2px solid ${theme.palette.background.paper}`,
		padding: "0 4px",
	},
}))(Badge);

export default function Message({
	idx,
	user,
	createdAt,
	struct,
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
			{struct && struct.status == 1 && (
				<div style={{ display: "flex", flex: 1 }}>
					<IconButton
						aria-label="cart"
						onClick={() => updateResponse(idx, 1)}
					>
						<StyledBadge
							badgeContent={struct.response == 1}
							color="secondary"
						>
							<ThumbUpAltIcon />
						</StyledBadge>
					</IconButton>
					<IconButton
						aria-label="cart"
						onClick={() => updateResponse(idx, 2)}
					>
						<StyledBadge
							badgeContent={struct.response == 2}
							color="secondary"
						>
							<ThumbDownAltIcon />
						</StyledBadge>
					</IconButton>
				</div>
			)}
			{/* <p>{struct.message}</p>
			<p>{struct.status}</p> */}
		</div>
	);
}
