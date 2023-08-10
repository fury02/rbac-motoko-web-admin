import React from "react";
import {Button, Container, Dropdown, Image, Nav, Navbar, NavDropdown, NavLink} from "react-bootstrap";
import {Link, Outlet} from "react-router-dom";
import {AuthComponent} from "../components/login/auth/AuthComponent";

export default class NavBarComponent extends React.Component {

    render() {
        return (
            <>
                <Navbar className="navBg" variant="light" expand="xl">
                    <Container>
                        <Navbar.Brand as={Link} to="/">RBAC - MOTOKO</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />

                        <Navbar.Collapse id="">
                            <Nav className="me-auto">

                                {/*<Nav className="me-auto">*/}
                                {/*    /!*<Nav.Link as={Link} to="/doc">Doc</Nav.Link>*!/*/}
                                {/*</Nav>*/}

                                <Dropdown>
                                    <Dropdown.Toggle as={NavLink}>Admin</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <NavDropdown.Item>
                                            <Nav.Link as={Link} to="admin/user_rbac_info">Users</Nav.Link>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item>
                                            <Nav.Link as={Link} to="admin/create">New</Nav.Link>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item>
                                            <Nav.Link as={Link} to="admin/bind/role_permissions">Permissions</Nav.Link>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item>
                                            <Nav.Link as={Link} to="admin/bind/user_roles">Roles</Nav.Link>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item>
                                            <Nav.Link as={Link} to="admin/roles_permissions">View roles</Nav.Link>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item>
                                            <Nav.Link as={Link} to="admin/delete">Delete</Nav.Link>
                                        </NavDropdown.Item>
                                        {/*<NavDropdown.Divider/>*/}
                                        {/*<NavDropdown.Item>*/}
                                        {/*    <Nav.Link as={Link} to="preloader">Preloader</Nav.Link>*/}
                                        {/*</NavDropdown.Item>*/}
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown>
                                    <Dropdown.Toggle as={NavLink}>Checks</Dropdown.Toggle>
                                    <Dropdown.Menu>

                                        {/*<Dropdown className="d-inline mx-2" autoClose="outside">*/}
                                        {/*    <Dropdown.Toggle style={{background:"white", color:"black", border:"white"}}>*/}
                                        {/*        Checking access to pages*/}
                                        {/*    </Dropdown.Toggle>*/}
                                        {/*    <Dropdown.Menu >*/}
                                        {/*        <NavDropdown.Item>*/}
                                        {/*            <Nav.Link as={Link} to="checking_access/pages/page_one">Page 1</Nav.Link>*/}
                                        {/*        </NavDropdown.Item>*/}
                                        {/*    </Dropdown.Menu>*/}
                                        {/*</Dropdown>*/}

                                        {/*<NavDropdown.Divider/>*/}

                                        <Dropdown className="d-inline mx-2" autoClose="outside">
                                            <Dropdown.Toggle style={{background:"white", color:"black", border:"white"}}>
                                                Checking access to data
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu >
                                                <NavDropdown.Item>
                                                    <Nav.Link as={Link} to="checking_access/data/check">Data</Nav.Link>
                                                </NavDropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                    </Dropdown.Menu>
                                </Dropdown>

                            </Nav>
                        </Navbar.Collapse>

                        <Nav className="end-0">
                            {/*<ConnectButton2ICComponent></ConnectButton2ICComponent>*/}
                            <AuthComponent></AuthComponent>
                        </Nav>

                    </Container>
                </Navbar>
                <section>
                    <Outlet></Outlet>
                </section>
                <Navbar variant="light" expand="sm" fixed={"bottom"}>
                    <Nav className="justify-content-end p-1" style={{ width: "50%" }}></Nav>
                    <Nav className="justify-content-end p-1" style={{ width: "50%" }}>
                        <Nav.Item className="end-0">
                            {/*<img src="/github.png" alt="image" width={35} height={35}></img>*/}
                            <Nav.Link as={Link} to="https://github.com/fury02/rbac-motoko"> Source code. 2023</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar>
            </>
        );
    }
}