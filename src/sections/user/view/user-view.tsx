import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormLabel from '@mui/material/FormLabel';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from 'src/firebase';

// Styles for Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40%',
  maxHeight: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 0.75,
  overflowY: 'auto',
};

export function StudentView() {
  interface Student {
    id: string;
    name: string;
    class: string;
    section: string;
    rollNumber: string;
    email: string;
    phone: number|'';
    address: string;
    guardianName: string;
    gender: string;
    dateOfBirth: string;
    hobbies: string[];
    grade: string;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterName, setFilterName] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'view' | 'edit' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Student>({
    id: '',
    name: '',
    class: '',
    section: '',
    rollNumber: '',
    email: '',
    phone: '',
    address: '',
    guardianName: '',
    gender: '',
    dateOfBirth: '',
    hobbies: [],
    grade: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch students from Firestore on component mount
  const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const fetchedStudents = querySnapshot.docs.map((document) => {
      const data = document.data();
      return { id: document.id, ...data } as Student;
    });
    setStudents(fetchedStudents);
  };

  useEffect(() => {
    fetchStudents();
  });

  // Pagination Handlers
  const handleChangePage = useCallback((_: any, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    const value = parseInt(event.target.value, 10);
    if ([10, 25, 50, 100].includes(value)) {
      setRowsPerPage(value);
    } else {
      setRowsPerPage(10); // default to 10
    }
    setPage(0);
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!newStudent.name.trim()) newErrors.name = 'Name is required';
    if (!newStudent.email.trim() || !/\S+@\S+\.\S+/.test(newStudent.email)) newErrors.email = 'Invalid email';
    if (!newStudent.phone || Number.isNaN(newStudent.phone)|| newStudent.phone.toString().length !== 10)
      newErrors.phone = 'Phone must be a 10-digit number';
    if (!newStudent.class) newErrors.class = 'Class is required';
    if (!newStudent.section) newErrors.section = 'Section is required';
    if (!newStudent.rollNumber) newErrors.rollNumber = 'Roll number is required';
    if (!newStudent.grade) {
      newErrors.grade = 'Grade is required';
    } else if (newStudent.grade.length !== 1) {
      newErrors.grade = 'Grade must be a single character';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Filtered Data
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(filterName.toLowerCase())
  );

  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filteredStudents.length);

  // Add/Edit Handlers
  const handleOpenModal = (type: 'add' | 'view' | 'edit', student: Student | null = null) => {
    console.log('Selected Student:', student); // Check the student object for ID
    setModalType(type);
    if (student) setSelectedStudent(student);
    else setSelectedStudent(null);
    setNewStudent(
      student || {
        id: '',
        name: '',
        class: '',
        section: '',
        rollNumber: '',
        email: '',
        phone: '',
        address: '',
        guardianName: '',
        gender: '',
        dateOfBirth: '',
        hobbies: [],
        grade: '',
      }
    );
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalType(null);
    setSelectedStudent(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async () => {
    if (!validate()) return;
    try {
      // Remove the id field from newStudent before adding it to Firestore
      const { id, ...studentData } = newStudent;
  
      // Add the student to Firestore without the id field
      const docRef = await addDoc(collection(db, 'students'), studentData);
  
      // Now docRef.id will contain the generated Firestore ID, so we can update the state
      const addedStudent: Student = { id: docRef.id, ...studentData };
  
      // Update the students state with the new student (including the generated id)
      setStudents((prev) => [...prev, addedStudent]);
  
      // Close the modal after adding
      handleCloseModal();
    } catch (error) {
      console.error('Error adding student: ', error);
    }
  };
  

  const handleEditStudent = async () => {
    if (!selectedStudent) return;
    try {
      const studentDoc = doc(db, 'students', selectedStudent.id);
      const { id, ...studentData } = newStudent;
      await updateDoc(studentDoc, studentData);
      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id ? { ...newStudent, id: student.id } : student
        )
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error editing student: ', error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (error) {
      console.error('Error deleting student: ', error);
    }
  };

  return (
    <Box padding={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Students</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenModal('add')}>
          Add Student
        </Button>
      </Box>

      <Card>
        <Box padding={2}>
          <TextField
            label="Search Students"
            variant="outlined"
            value={filterName}
            onChange={(event) => setFilterName(event.target.value)}
            size="small"
            fullWidth
            
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenModal('view', student)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenModal('edit', student)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteStudent(student.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Card>

      {/* Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {modalType === 'view' && selectedStudent && (
            <Box>
              <Typography variant="h6">Student Details</Typography>
              {Object.entries(selectedStudent).map(([key, value]) => (
                <Typography key={key}>
                  <strong>{key}:</strong> {value}
                </Typography>
              ))}
            </Box>
          )}

          {(modalType === 'add' || modalType === 'edit') && (
            <Box>
              <Typography variant="h6">
                {modalType === 'add' ? 'Add Student' : 'Edit Student'}
              </Typography>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={newStudent.name}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.name}
            helperText={errors.name}
              />
              <TextField
                fullWidth
                label="Class"
                name="class"
                value={newStudent.class}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.class}
            helperText={errors.class}
              />
              <TextField
                fullWidth
                label="Section"
                name="section"
                value={newStudent.section}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.section}
            helperText={errors.section}
              />
              <TextField
                fullWidth
                label="Roll Number"
                name="rollNumber"
                value={newStudent.rollNumber}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.rollNumber}
            helperText={errors.rollNumber}
              />
               <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date" 
                value={newStudent.dateOfBirth}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true, 
                }}
                error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={newStudent.email}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.email}
            helperText={errors.email}
              />
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={newStudent.phone}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.phone}
            helperText={errors.phone}
              />
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={newStudent.address}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.address}
            helperText={errors.address}
              />
              <TextField
                fullWidth
                label="Guardian Name"
                name="guardianName"
                value={newStudent.guardianName}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.guardianName}
            helperText={errors.guardianName}
              />
              <FormControl fullWidth margin="normal">
              <InputLabel shrink={!!newStudent.gender}>Gender</InputLabel>
                <select
                  name="gender"
                  value={newStudent.gender || 'Gender'}
                  onChange={(e) => handleInputChange(e as any)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    borderColor: '#ccc',
                    width: '100%',
                    height: '55px',
                  }}
                >
                  <option value="Gender"/>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </FormControl>

              <FormControl margin="normal">
                <FormLabel component="legend">Hobbies</FormLabel>
                <Box display="flex" gap={2} sx={{ mt: 1, mb: 2, color: 'text.secondary' }} mb={4}>
                  <input
                    type="checkbox"
                    name="hobbies"
                    value="Sports"
                    checked={newStudent.hobbies.includes('Sports')}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        hobbies: e.target.checked
                          ? [...prev.hobbies, e.target.value]
                          : prev.hobbies.filter((hobby) => hobby !== e.target.value),
                      }))
                    }
                  />
                  Sports
                  <input
                    type="checkbox"
                    name="hobbies"
                    value="Music"
                    checked={newStudent.hobbies.includes('Music')}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        hobbies: e.target.checked
                          ? [...prev.hobbies, e.target.value]
                          : prev.hobbies.filter((hobby) => hobby !== e.target.value),
                      }))
                    }
                  />
                  Music
                  <input
                    type="checkbox"
                    name="hobbies"
                    value="Reading"
                    checked={newStudent.hobbies.includes('Reading')}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        hobbies: e.target.checked
                          ? [...prev.hobbies, e.target.value]
                          : prev.hobbies.filter((hobby) => hobby !== e.target.value),
                      }))
                    }
                  />
                  Reading
                </Box>
              </FormControl>
              <TextField
                fullWidth
                label="Grade"
                name="grade"
                value={newStudent.grade}
                onChange={handleInputChange}
                margin="normal"
                error={!!errors.grade}
            helperText={errors.grade}
              />

              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button onClick={handleCloseModal} sx={{ mr: 2 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={modalType === 'add' ? handleAddStudent : handleEditStudent}
                >
                  {modalType === 'add' ? 'Add' : 'Save'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
