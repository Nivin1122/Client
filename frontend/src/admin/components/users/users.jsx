import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Box,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Block, Search } from "@mui/icons-material";
import axiosInstance from "@/utils/adminAxiosInstance";

const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/userlist");
        setUsersData(response.data);
      } catch (err) {
        setError("Failed to fetch users data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBlockUser = (userId) => {
    setUserToBlock(userId);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!userToBlock) return;

    try {
      const response = await axiosInstance.put(`/block/${userToBlock}`);
      setUsersData((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userToBlock ? { ...user, isDeleted: true } : user
        )
      );
      setSnackbarMessage(response.data.message);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error blocking user:", err);
      setSnackbarMessage("Error blocking user.");
      setSnackbarOpen(true);
    }
    setIsConfirmationModalOpen(false);
  };

  const handleUnblockUser = async (userId) => {
    try {
      const response = await axiosInstance.put(`/unblock/${userId}`);
      setUsersData((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isDeleted: false } : user
        )
      );
      setSnackbarMessage(response.data.message);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error unblocking user:", err);
      setSnackbarMessage("Error unblocking user.");
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return <Box>Error: {error}</Box>;
  }

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmationModalClose = () => setIsConfirmationModalOpen(false);

  return (
    <Box sx={{ padding: 3, backgroundColor: "#212121" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#333", 
          borderRadius: 2,
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Box>
          <Box
            component="span"
            sx={{ fontSize: "20px", fontWeight: "bold", color: "#FF9800" }}
          >
            Users
          </Box>
        </Box>
        <Box>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            InputProps={{
              endAdornment: (
                <IconButton>
                  <Search sx={{ color: "#FF9800" }} />
                </IconButton>
              ),
            }}
            sx={{
              backgroundColor: "#424242", // Dark background for input
              color: "#ffffff", // White text
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "#ffffff", // White text inside input
                "& fieldset": {
                  borderColor: "#FF9800", // Orange border for the input
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          padding: 2,
          backgroundColor: "#333", // Dark background for table
          borderRadius: 3,
        }}
      >
        <Table
          sx={{
            width: "100%",
            backgroundColor: "#424242", // Light black background for table
            overflow: "auto",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Profile
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Username
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Created At
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar src={user.image} alt={user.firstname} />
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    {user.username}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>{user.email}</TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    {new Date(user.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {user.isDeleted ? (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Block />}
                        sx={{
                          backgroundColor: "black",
                          color: "gray",
                        }}
                        onClick={() => handleUnblockUser(user._id)}
                      >
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Block />}
                        sx={{
                          backgroundColor: "black",
                          color: "#FF9800", // Orange for active buttons
                        }}
                        onClick={() => handleBlockUser(user._id)}
                      >
                        Block
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={usersData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          color: "#FF9800", // Orange color for pagination
        }}
      />

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmationModalOpen}
        onClose={handleConfirmationModalClose}
      >
        <DialogTitle>Confirm Block</DialogTitle>
        <DialogContent>Are you sure you want to block this User?</DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmationModalClose}
            sx={{ color: "#FF9800" }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmBlock} sx={{ color: "#FF9800" }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Button,
//   TextField,
//   IconButton,
//   Paper,
//   Avatar,
//   Box,
//   TablePagination,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import { Add, Block, Search } from "@mui/icons-material";
// import axios from "axios";

// const Users = () => {
//   const [usersData, setUsersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarOpen, setSnackbarOpen] = useState(false);

//   // Fetch users data from API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           "http://localhost:9090/api/admin/userlist"
//         );
//         setUsersData(response.data);
//       } catch (err) {
//         setError("Failed to fetch users data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0); // Reset to the first page when changing rows per page
//   };

//   const handleBlockUser = async (userId) => {
//     try {
//       const response = await axios.put(
//         `http://localhost:9090/api/admin/block/${userId}`
//       );
//       setUsersData((prevUsers) =>
//         prevUsers.map((user) =>
//           user._id === userId ? { ...user, isDeleted: true } : user
//         )
//       );
//       setSnackbarMessage(response.data.message);
//       setSnackbarOpen(true);
//     } catch (err) {
//       console.error("Error blocking user:", err);
//       setSnackbarMessage(response.data.message);
//       setSnackbarOpen(true);
//     }
//   };

//   const handleUnblockUser = async (userId) => {
//     try {
//       const response = await axios.put(
//         `http://localhost:9090/api/admin/unblock/${userId}`
//       );
//       setUsersData((prevUsers) =>
//         prevUsers.map((user) =>
//           user._id === userId ? { ...user, isDeleted: false } : user
//         )
//       );
//       setSnackbarMessage(response.data.message);
//       setSnackbarOpen(true);
//     } catch (err) {
//       console.error("Error unblocking user:", err);
//       setSnackbarMessage(response.data.message);
//       setSnackbarOpen(true);
//     }
//   };

//   if (loading) {
//     return <Box>Loading...</Box>;
//   }

//   if (error) {
//     return <Box>Error: {error}</Box>;
//   }

//   const handleSnackbarClose = () => setSnackbarOpen(false);

//   return (
//     <Box sx={{ padding: 3 }}>
//       {/* Header */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           backgroundColor: "orange",
//           borderRadius: 2,
//           padding: 2,
//           marginBottom: 2,
//         }}
//       >
//         <Box>
//           <Box
//             component="span"
//             sx={{ fontSize: "20px", fontWeight: "bold", color: "white" }}
//           >
//             Users
//           </Box>
//         </Box>
//         <Box>
//           <TextField
//             variant="outlined"
//             size="small"
//             placeholder="Search..."
//             InputProps={{
//               endAdornment: (
//                 <IconButton>
//                   <Search />
//                 </IconButton>
//               ),
//             }}
//           />
//         </Box>
//       </Box>

//       {/* Table */}
//       <TableContainer
//         component={Paper}
//         sx={{
//           padding: 2,
//           backgroundColor: "orange",
//         }}
//       >
//         <Table
//           sx={{
//             width: "100%",
//             borderRadius: 3,
//             backgroundColor: "#f8f8f8",
//             overflow: "auto",
//           }}
//         >
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ backgroundColor: "white", fontWeight: "bold" }}>
//                 Profile
//               </TableCell>
//               <TableCell sx={{ backgroundColor: "white", fontWeight: "bold" }}>
//                 Fullname
//               </TableCell>
//               <TableCell sx={{ backgroundColor: "white", fontWeight: "bold" }}>
//                 Username
//               </TableCell>
//               <TableCell sx={{ backgroundColor: "white", fontWeight: "bold" }}>
//                 Email
//               </TableCell>
//               <TableCell sx={{ backgroundColor: "white", fontWeight: "bold" }}>
//                 Created At
//               </TableCell>
//               <TableCell sx={{ backgroundColor: "white", fontWeight: "bold" }}>
//                 Status
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {usersData
//               .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//               .map((user) => (
//                 <TableRow key={user._id}>
//                   <TableCell>
//                     <Avatar src={user.image} alt={user.firstname} />
//                   </TableCell>
//                   <TableCell>{`${user.firstname} ${user.lastname}`}</TableCell>
//                   <TableCell>{user.username}</TableCell>
//                   <TableCell>{user.email}</TableCell>
//                   <TableCell>
//                     {new Date(user.createdAt).toLocaleString()}
//                   </TableCell>
//                   <TableCell>
//                     {user.isDeleted ? (
//                       <Button
//                         variant="contained"
//                         color="error"
//                         startIcon={<Block />}
//                         sx={{
//                           backgroundColor: "black",
//                           color: "gray",
//                         }}
//                         onClick={() => handleUnblockUser(user._id)}
//                       >
//                         Unblock
//                       </Button>
//                     ) : (
//                       <Button
//                         variant="contained"
//                         color="error"
//                         startIcon={<Block />}
//                         sx={{
//                           backgroundColor: "black",
//                           color: "orange",
//                         }}
//                         onClick={() => handleBlockUser(user._id)}
//                       >
//                         Block
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Pagination */}
//       <TablePagination
//         component="div"
//         count={usersData.length}
//         page={page}
//         onPageChange={handleChangePage}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//       />

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={3000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert onClose={handleSnackbarClose} severity="success">
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Users;
