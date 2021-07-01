import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import React, { useState } from "react";

function AdminPage() {
    const [address, setAddress] = useState();
    const [message, setMessage] = useState();
    return (
        <Container
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div>
                <TextField
                    style={{ width: "60%" }}
                    label="Vehicle Address"
                    helperText="Enter Public Address.."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <Button variant="contained" color="primary">
                    Add Vehicle
                </Button>
            </div>
            <div>
                <TextField
                    style={{ width: "60%" }}
                    label="New Message"
                    helperText="Enter New Message.."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" color="primary">
                    Add Message
                </Button>
            </div>
        </Container>
    );
}

export default AdminPage;
