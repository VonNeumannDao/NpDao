import {styled} from "@mui/material";
import {Link} from "react-router-dom";

export const StyledLink = styled(Link)`
      text-decoration: none;
      margin-left: 2px;
      margin-right: 5px;
      transition: text-decoration 0.2s ease;
    
      &:hover {
        text-decoration: underline;
      }
`;