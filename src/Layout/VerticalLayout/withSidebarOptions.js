import { useMemo } from "react";
import { useUserStore } from "../../store/useUserStore";
import { AdminSidebarData, AssociateSidebarData } from "./SidebarData";
import { USER_TYPE } from "../../constants/global";

// Locations where D.I.Y. Calculator is visible
const DIY_ALLOWED_LOCATIONS = ["Noida", "Gurugram", "Ghaziabad", "Pune"];
// const ALLOWED_META_LEADS_EMP_CODES = ["1670", "1025", "1"];

// Higher-Order Component
const withSidebarOptions = (Component) => {
  return (props) => {
    const { sidebar, role, showRevanueLink, branchManager, mainTl, subTl, locationName } = useUserStore((state) => state.user);

    const allowedSidebarOptions = useMemo(() => {

      // ── ADMIN / OTHER ──────────────────────────────────────────────────────
      if (role === USER_TYPE.ADMIN || role === USER_TYPE.OTHER) {
        return AdminSidebarData.filter((item) => {
          if (!item?.url || item?.subItem) return true;
          return sidebar[item.url.replace("/", "")];
        })
          .map((item) => {
            if (item?.subItem?.length > 0) {
              const filteredSubItem = item.subItem.filter((cItem) => {
                const subItemLink = cItem.link.split("/")?.[1];
                if (!subItemLink) return false;
                // if (
                //   cItem.link === "/google-sheet-leads" &&
                //   !ALLOWED_META_LEADS_EMP_CODES.includes(empCode)
                // ) {
                //   return false;
                // }
                // Hide D.I.Y. Calculator if location not allowed
                if (
                  cItem.link === "/diy-calculator-menu" &&
                  !DIY_ALLOWED_LOCATIONS.includes(locationName)
                ) {
                  return false;
                }

                return sidebar[subItemLink];
              });
              return { ...item, subItem: filteredSubItem };
            }
            return item;
          })
          .filter((item) => {
            return item?.url ? true : item?.subItem?.length > 0;
          });
      }

      // ── ASSOCIATE ──────────────────────────────────────────────────────────
      const filteredAssociateSidebarData = AssociateSidebarData.map((item) => {

        // Remove BM Menu when not a branch manager
        if (item.label === "BM Menu" && branchManager === "No") {
          return null;
        }

        if (item.subItem) {
          return {
            ...item,
            subItem: item.subItem.filter((subItem) => {
              // if (
              //   subItem.link === "/google-sheet-leads" &&
              //   !ALLOWED_META_LEADS_EMP_CODES.includes(String(empCode))
              // ) {
              //   return false;
              // }
              // Hide D.I.Y. Calculator if location not in allowed list
              if (
                subItem.link === "/diy-calculator-menu" &&
                !DIY_ALLOWED_LOCATIONS.includes(locationName)
              ) {
                return false;
              }

              // Hide certain items for non-TL associates
              if (mainTl === "NO" && subTl === "NO") {
                return !(
                  subItem.sublabel === "Candidate Details" ||
                  subItem.sublabel === "IVR Recording" ||
                  subItem.sublabel === "HOD FNF List" ||
                  subItem.sublabel === "KYT" ||
                  subItem.sublabel === "Assigned Candidate" ||
                  subItem.sublabel === "Due Payment" ||
                  subItem.sublabel === "Report P100 Leads" ||
                  subItem.sublabel === "P100 Leads Report"
                  // subItem.sublabel === "Transfer P100 Leads"
                );
              }

              return true;
            }),
          };
        }

        // Remove Enquiry if not allowed
        if (showRevanueLink === "NO" && item.label === "Enquiry") {
          return null;
        }

        // Remove FNF Menu & HR Menu for non-TL associates
        if (mainTl === "NO" && subTl === "NO" && item.label === "FNF Menu") {
          return null;
        }
        if (mainTl === "NO" && subTl === "NO" && item.label === "HR Menu") {
          return null;
        }

        return item;
      });

      return filteredAssociateSidebarData.filter((item) => {
        return item?.url ? true : item?.subItem?.length > 0;
      });

    }, [role, sidebar, locationName, branchManager, showRevanueLink, mainTl, subTl]);

    return <Component {...props} list={allowedSidebarOptions} />;
  };
};

export default withSidebarOptions;