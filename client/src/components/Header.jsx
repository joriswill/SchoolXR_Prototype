import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
} from "flowbite-react";
import AppBreadcrumb from "./AppBreadcrumb.jsx";
import { HiLogout } from "react-icons/hi";

function Header({ activeIndex }) {
  return (
    <>
      <Navbar className="py-5 min-h-0 w-full border-b bg-white dark:bg-gray-900">
        <div
          className="flex flex-col w-full max-w-7xl mx-auto"
          style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 12 }}
        >
          {/* Top row: Brand left, Avatar right */}
          <div className="flex justify-between items-center">
            <NavbarBrand href="/" className="flex items-center">
              <img
                src="/assets/logo.png"
                className="mr-3 h-6 sm:h-9"
                alt="SchoolXR Logo"
              />
              <p className="text-white">SchoolXR</p>
            </NavbarBrand>
            <Dropdown
              inline
              arrowIcon={false}
              label={
                <Avatar
                  className="z-10"
                  alt="User settings"
                  img="/assets/user_teacher.png"
                  rounded
                />
              }
            >
              <DropdownHeader>
                <span className="block text-sm">Martin Berger</span>
                <span className="block truncate text-sm font-medium">
                  martin.b@schule.de
                </span>
              </DropdownHeader>
              <DropdownItem>Startseite</DropdownItem>
              <DropdownItem>Einstellungen</DropdownItem>
              <DropdownItem>Verlauf</DropdownItem>
              <DropdownDivider />
              <DropdownItem href="/">
                Verlassen
                <HiLogout className="ml-2" />
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </Navbar>
      {/* Breadcrumb centered with rounded background and horizontal padding */}
      <div
        className="w-full flex justify-center"
        style={{
          transform: "translateY(-15px)",
        }}
      >
        <div
          className="breadcrumb-transform bg-white dark:bg-gray-800 rounded-full shadow flex justify-center"
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <AppBreadcrumb activeIndex={activeIndex} />
        </div>
      </div>
      <style>
        {`
          @media (min-width: 640px) {
            .breadcrumb-transform {
              transform: translateY(-30px) !important;
            }
          }
        `}
      </style>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              var el = document.querySelector('.breadcrumb-transform');
              if (el) {
                el.classList.add('breadcrumb-transform');
              }
            });
          `,
        }}
      />
    </>
  );
}

export default Header;
