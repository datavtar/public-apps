import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    User, UserPlus, Edit, Trash2, Search, Filter, ArrowUp, ArrowDown, Sun, Moon, X, BookOpen, GraduationCap, Target, ChartLine, Plus, Download, Upload, FileText, Settings, ArrowDownUp
} from 'lucide-react';
import styles from './styles/styles.module.css'; // Keep this import

// ========= TYPE DEFINITIONS =========
interface Student {
    id: string;
    name: string;
    gradeLevel: string; // Keep as string for flexibility e.g., \"Kindergarten\", \"Grade 5\", \"AP Physics\"
    createdAt: number; // timestamp
}

interface ProgressRecord {
    id: string;
    studentId: string;
    assignmentName: string;
    score: number; // Assuming 0-100 scale
    date: string; // Store as ISO string (YYYY-MM-DD)
    notes?: string;
}

type SortKey = keyof Student | 'progressCount';

interface SortConfig {
    key: SortKey;
    direction: 'ascending' | 'descending';
}

type ModalType = 'addStudent' | 'editStudent' | 'addProgress' | 'viewProgress' | 'editProgress' | 'settings';

interface ModalState {
    type: ModalType | null;
    data?: any; // Data needed for the modal (e.g., student to edit, student for progress)
}

// ========= CONSTANTS =========
const LOCAL_STORAGE_KEYS = {
    STUDENTS: 'teacherApp_students',
    PROGRESS: 'teacherApp_progress',
    DARK_MODE: 'teacherApp_darkMode',
};

const INITIAL_STUDENTS: Student[] = [
    { id: 's1', name: 'Alice Wonderland', gradeLevel: 'Grade 5', createdAt: Date.now() - 200000 },
    { id: 's2', name: 'Bob The Builder', gradeLevel: 'Grade 5', createdAt: Date.now() - 100000 },
    { id: 's3', name: 'Charlie Chaplin', gradeLevel: 'Grade 6', createdAt: Date.now() },
];

const INITIAL_PROGRESS: ProgressRecord[] = [
    { id: 'p1', studentId: 's1', assignmentName: 'Math Test 1', score: 85, date: '2024-05-10', notes: 'Good effort' },
    { id: 'p2', studentId: 's1', assignmentName: 'Reading Comprehension', score: 92, date: '2024-05-15' },
    { id: 'p3', studentId: 's2', assignmentName: 'Math Test 1', score: 78, date: '2024-05-10' },
    { id: 'p4', studentId: 's1', assignmentName: 'Math Test 2', score: 88, date: '2024-06-01' },
    { id: 'p5', studentId: 's3', assignmentName: 'History Project', score: 95, date: '2024-06-05', notes: 'Excellent research' },
];

// ========= UTILITY FUNCTIONS =========
const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
};

const formatIsoDate = (isoDate: string): string => {
    // Assuming isoDate is 'YYYY-MM-DD'
    const parts = isoDate.split('-');
    if (parts.length === 3) {
        // Use UTC to avoid timezone issues with date formatting
        return new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))).toLocaleDateString();
    }
    return isoDate; // fallback
}

// ========= THEME TOGGLE COMPONENT =========
const ThemeToggle: React.FC<{ isDarkMode: boolean; toggleTheme: () => void }> = ({ isDarkMode, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            role="switch"
            aria-checked={isDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            {/* Icons positioned using CSS module styles */}
            <span className={`${styles.themeToggleIcon} ${styles.lightModeIcon}`} aria-hidden="true">
                <Sun size={16} />
            </span>
            <span className={`${styles.themeToggleIcon} ${styles.darkModeIcon}`} aria-hidden="true">
                <Moon size={16} />
            </span>
            <span className="theme-toggle-thumb"></span>
        </button>
    );
};

// ========= MAIN APP COMPONENT =========
const App: React.FC = () => {
    // ========= STATE =========
    const [students, setStudents] = useState<Student[]>([]);
    const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterGrade, setFilterGrade] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [modalState, setModalState] = useState<ModalState>({ type: null, data: null });

    // Refs for controlled components in modal (ensure values are set)
    const studentNameRef = useRef<HTMLInputElement>(null);
    const studentGradeRef = useRef<HTMLInputElement>(null);
    const progressAssignmentRef = useRef<HTMLInputElement>(null);
    const progressScoreRef = useRef<HTMLInputElement>(null);
    const progressDateRef = useRef<HTMLInputElement>(null);
    const progressNotesRef = useRef<HTMLTextAreaElement>(null);

    // ========= EFFECTS =========

    // Load data and theme preference from localStorage on mount
    useEffect(() => {
        try {
            // Load Theme
            const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialDarkMode = savedMode === 'true' || (savedMode === null && prefersDark);
            setIsDarkMode(initialDarkMode);
             // Apply class immediately based on loaded/preferred theme
            if (initialDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // Load Students
            const savedStudents = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
             // Initialize with default if nothing is found or parsing fails
            let loadedStudents = INITIAL_STUDENTS;
            if (savedStudents) {
                try {
                    loadedStudents = JSON.parse(savedStudents);
                } catch (parseError) {
                    console.error("Error parsing students from localStorage:", parseError);
                    localStorage.removeItem(LOCAL_STORAGE_KEYS.STUDENTS); // Clear corrupted data
                }
            }
            setStudents(loadedStudents);
            if (!savedStudents) {
                 localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
            }

            // Load Progress Records
            const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRESS);
            let loadedProgress = INITIAL_PROGRESS;
             if (savedProgress) {
                 try {
                     loadedProgress = JSON.parse(savedProgress);
                 } catch (parseError) {
                     console.error("Error parsing progress from localStorage:", parseError);
                     localStorage.removeItem(LOCAL_STORAGE_KEYS.PROGRESS); // Clear corrupted data
                 }
             }
            setProgressRecords(loadedProgress);
             if (!savedProgress) {
                 localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, JSON.stringify(INITIAL_PROGRESS));
            }

        } catch (err) {
            console.error("Error during initial data load:", err);
            setError("Failed to load initial data. Using defaults.");
             // Ensure defaults are set if any error occurred before state was set
            if (!students?.length) setStudents(INITIAL_STUDENTS);
            if (!progressRecords?.length) setProgressRecords(INITIAL_PROGRESS);
        } finally {
            setIsLoading(false);
        }
    }, []); // Run only once on mount

    // Save students to localStorage
    useEffect(() => {
        if (!isLoading) { // Avoid saving initial empty/default state before loading finishes
            try {
                localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
            } catch (err) {
                console.error("Error saving students to localStorage:", err);
                setError("Failed to save student data.");
            }
        }
    }, [students, isLoading]);

    // Save progress records to localStorage
    useEffect(() => {
         if (!isLoading) {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, JSON.stringify(progressRecords));
            } catch (err) {
                console.error("Error saving progress to localStorage:", err);
                setError("Failed to save progress data.");
            }
        }
    }, [progressRecords, isLoading]);

    // Update dark mode class and save preference
    useEffect(() => {
        // Only run if not loading to avoid flicker on initial load
        if (!isLoading) {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'false');
            }
        }
    }, [isDarkMode, isLoading]);

     // Handle Escape key for closing modal
     useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        // closeModal is stable due to useCallback
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ========= DATA PROCESSING =========

    const uniqueGradeLevels = useMemo(() => {
        const grades = new Set(students.map(s => s.gradeLevel));
        return Array.from(grades).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); // Sort grades naturally
    }, [students]);

    const getProgressCountForStudent = useCallback((studentId: string): number => {
        return progressRecords.filter(p => p.studentId === studentId).length;
    }, [progressRecords]);

    const filteredAndSortedStudents = useMemo(() => {
        // Ensure students is an array before processing
         if (!Array.isArray(students)) {
             console.error("Students data is not an array:", students);
             return [];
         }
        return students
            .filter(student =>
                student && // Ensure student object exists
                student.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filterGrade === '' || student.gradeLevel === filterGrade)
            )
            .sort((a, b) => {
                const { key, direction } = sortConfig;
                // Handle potential undefined values during sorting
                let valA: string | number | undefined;
                let valB: string | number | undefined;

                if (key === 'progressCount') {
                    valA = getProgressCountForStudent(a.id);
                    valB = getProgressCountForStudent(b.id);
                } else {
                    // Safely access properties
                    valA = a?.[key];
                    valB = b?.[key];
                }

                // Define comparison logic handling undefined/null
                let comparison = 0;
                if (valA === undefined || valA === null) comparison = (valB === undefined || valB === null) ? 0 : -1;
                else if (valB === undefined || valB === null) comparison = 1;
                else if (valA > valB) comparison = 1;
                else if (valA < valB) comparison = -1;

                return direction === 'ascending' ? comparison : comparison * -1;
            });
    }, [students, searchTerm, filterGrade, sortConfig, getProgressCountForStudent]);

    // ========= EVENT HANDLERS =========

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterGrade(event.target.value);
    };

    const handleSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    const openModal = (type: ModalType, data: any = null) => {
        setError(null); // Clear previous modal errors
        setModalState({ type, data });
        document.body.classList.add('modal-open');
    };

    // Wrap closeModal in useCallback as it's used in useEffect dependency array
    const closeModal = useCallback(() => {
        setModalState({ type: null, data: null });
        setError(null); // Clear errors when closing modal
        document.body.classList.remove('modal-open');
    }, []);

    // --- CRUD Operations ---

    const handleAddStudent = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Use refs to get current values
        const name = studentNameRef.current?.value.trim();
        const gradeLevel = studentGradeRef.current?.value.trim();

        if (!name || !gradeLevel) {
            setError("Student Name and Grade Level are required.");
            return;
        }

        const newStudent: Student = {
            id: generateId(),
            name,
            gradeLevel,
            createdAt: Date.now(),
        };
        setStudents(prev => [...prev, newStudent]);
        closeModal();
    };

    const handleEditStudent = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const studentToEdit = modalState.data as Student | undefined;
        if (!studentToEdit) return;

        const name = studentNameRef.current?.value.trim();
        const gradeLevel = studentGradeRef.current?.value.trim();

        if (!name || !gradeLevel) {
            setError("Student Name and Grade Level are required.");
            return;
        }

        setStudents(prev =>
            prev.map(s =>
                s.id === studentToEdit.id ? { ...s, name, gradeLevel } : s
            )
        );
        closeModal();
    };

    const handleDeleteStudent = (studentId: string) => {
        if (window.confirm("Are you sure you want to delete this student and all their progress records? This action cannot be undone.")) {
            setStudents(prev => prev.filter(s => s.id !== studentId));
            // Also delete associated progress records
            setProgressRecords(prev => prev.filter(p => p.studentId !== studentId));
        }
    };

    const handleAddProgress = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const student = modalState.data as Student | undefined;
        if (!student?.id) {
             setError("Cannot add progress: Student data missing.");
             return;
        }

        const assignmentName = progressAssignmentRef.current?.value.trim();
        const scoreString = progressScoreRef.current?.value;
        const date = progressDateRef.current?.value;
        const notes = progressNotesRef.current?.value.trim();

         if (!assignmentName || !scoreString || !date) {
            setError("Assignment Name, Score, and Date are required.");
            return;
        }
        const score = parseInt(scoreString, 10);
        if (isNaN(score) || score < 0 || score > 100) {
             setError("Score must be a number between 0 and 100.");
             return;
        }

        const newRecord: ProgressRecord = {
            id: generateId(),
            studentId: student.id,
            assignmentName,
            score,
            date,
            notes: notes || undefined, // Store empty string as undefined
        };
        setProgressRecords(prev => [...prev, newRecord]);
        closeModal();
    };

     const handleEditProgress = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const recordToEdit = modalState.data as ProgressRecord | undefined;
        if (!recordToEdit?.id) {
            setError("Cannot edit progress: Record data missing.");
            return;
        }

        const assignmentName = progressAssignmentRef.current?.value.trim();
        const scoreString = progressScoreRef.current?.value;
        const date = progressDateRef.current?.value;
        const notes = progressNotesRef.current?.value.trim();

        if (!assignmentName || !scoreString || !date) {
            setError("Assignment Name, Score, and Date are required.");
            return;
        }
         const score = parseInt(scoreString, 10);
         if (isNaN(score) || score < 0 || score > 100) {
             setError("Score must be a number between 0 and 100.");
             return;
         }

        setProgressRecords(prev =>
            prev.map(p =>
                p.id === recordToEdit.id ? { ...p, assignmentName, score, date, notes: notes || undefined } : p
            )
        );
        closeModal();
    };

    const handleDeleteProgress = (recordId: string) => {
         if (window.confirm("Are you sure you want to delete this progress record?")) {
            setProgressRecords(prev => prev.filter(p => p.id !== recordId));
            // If the View Progress modal is open for the student whose record was deleted,
            // we might need to update its state if it held a copy of the records.
            // However, since our view modal reads directly from the main progressRecords state,
            // it will re-render correctly when the state updates.
         }
    };

    // --- Settings Handlers ---
    const handleExportData = () => {
        try {
            const dataToExport = {
                students,
                progressRecords,
            };
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `student_progress_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            setError("Failed to export data.");
            openModal('settings'); // Reopen settings modal to show error
        }
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Store the input element to reset it later
        const fileInput = event.target;

        if (!window.confirm("Importing data will overwrite existing students and progress records. Are you sure you want to proceed?")) {
            // Clear the file input value
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Failed to read file content.");
                }
                const importedData = JSON.parse(text);

                // Basic validation (check if keys exist and are arrays)
                if (!Array.isArray(importedData.students) || !Array.isArray(importedData.progressRecords)) {
                     throw new Error("Invalid file format. Expected 'students' and 'progressRecords' arrays.");
                }

                // TODO: Add more robust validation here (e.g., using AJV or manual checks)
                // Example: Check if students have id, name, gradeLevel, createdAt
                // Example: Check if progress records have id, studentId, assignmentName, score, date

                setStudents(importedData.students);
                setProgressRecords(importedData.progressRecords);
                setError(null); // Clear previous errors
                alert("Data imported successfully!");
                closeModal(); // Close settings modal after successful import

            } catch (err: any) {
                console.error("Import failed:", err);
                setError(`Failed to import data: ${err.message || 'Invalid file format.'}`);
                 // Keep the settings modal open to show the error
                 setModalState(prev => ({ ...prev, type: 'settings' })); // Ensure modal stays 'settings'
            } finally {
                 // Clear the file input value in all cases after processing
                 fileInput.value = '';
            }
        };
        reader.onerror = () => {
             setError("Failed to read the selected file.");
             setModalState(prev => ({ ...prev, type: 'settings' }));
             fileInput.value = '';
        }
        reader.readAsText(file);
    };


    // ========= RENDER LOGIC =========

    const renderSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) {
            return <ArrowDownUp size={14} className="ml-1 opacity-30 group-hover:opacity-60" />; // Use group-hover
        }
        return sortConfig.direction === 'ascending' ? (
            <ArrowUp size={14} className="ml-1" />
        ) : (
            <ArrowDown size={14} className="ml-1" />
        );
    };

    const renderModalContent = () => {
        if (!modalState.type) return null;

        switch (modalState.type) {
            case 'addStudent':
            case 'editStudent': {
                const isEditingStudent = modalState.type === 'editStudent';
                // Provide default empty object if data is null/undefined
                const studentData = modalState.data as Student | undefined ?? { name: '', gradeLevel: ''};

                return (
                    <form onSubmit={isEditingStudent ? handleEditStudent : handleAddStudent} className="flex flex-col h-full">
                         <div className="modal-header">
                            <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                                {isEditingStudent ? 'Edit Student' : 'Add New Student'}
                            </h3>
                             <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" // Standard close button styling
                                aria-label="Close modal"
                            >
                                <X size={24} />
                             </button>
                        </div>
                        <div className="mt-4 space-y-4 flex-grow">
                            <div className="form-group">
                                <label htmlFor="studentName" className="form-label">Student Name</label>
                                <input
                                    id="studentName"
                                    name="studentName"
                                    type="text"
                                    required
                                    className="input input-responsive"
                                    defaultValue={studentData.name}
                                    aria-required="true"
                                    ref={studentNameRef}
                                    autoFocus // Focus the first field
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="gradeLevel" className="form-label">Grade Level</label>
                                <input
                                    id="gradeLevel"
                                    name="gradeLevel"
                                    type="text"
                                    required
                                    className="input input-responsive"
                                    defaultValue={studentData.gradeLevel}
                                    aria-required="true"
                                    ref={studentGradeRef}
                                />
                            </div>
                             {error && <p className="form-error mt-2 text-sm">{error}</p>}
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={closeModal} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 btn-responsive">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-responsive">
                                {isEditingStudent ? 'Save Changes' : 'Add Student'}
                            </button>
                        </div>
                    </form>
                );
            }
             case 'addProgress':
             case 'editProgress': {
                const isEditingProgress = modalState.type === 'editProgress';
                const progressData = isEditingProgress ? modalState.data as ProgressRecord : null;
                const studentForProgress = isEditingProgress
                    ? students.find(s => s.id === progressData?.studentId)
                    : modalState.data as Student | undefined;

                 if (!studentForProgress && !isEditingProgress) {
                     console.error("Missing student data for add progress modal");
                     return <p className="text-red-500 dark:text-red-400 p-4">Error: Student data not found. Please close and try again.</p>;
                 }
                 if (!progressData && isEditingProgress) {
                      console.error("Missing progress data for edit progress modal");
                     return <p className="text-red-500 dark:text-red-400 p-4">Error: Progress record data not found. Please close and try again.</p>;
                 }
                 // Provide default values for add mode or if data is somehow incomplete
                 const defaultValues = {
                     assignmentName: progressData?.assignmentName ?? '',
                     score: progressData?.score?.toString() ?? '', // Input type number needs string
                     date: progressData?.date ?? new Date().toISOString().split('T')[0],
                     notes: progressData?.notes ?? '',
                 };

                return (
                    <form onSubmit={isEditingProgress ? handleEditProgress : handleAddProgress} className="flex flex-col h-full">
                        <div className="modal-header">
                             <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                                {isEditingProgress ? 'Edit Progress Record' : `Add Progress for ${studentForProgress?.name ?? 'Student'}`}
                            </h3>
                             <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                             </button>
                        </div>
                        <div className="mt-4 space-y-4 flex-grow">
                             <div className="form-group">
                                <label htmlFor="assignmentName" className="form-label">Assignment/Activity Name</label>
                                <input id="assignmentName" name="assignmentName" type="text" required className="input input-responsive" defaultValue={defaultValues.assignmentName} ref={progressAssignmentRef} autoFocus />
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div className="form-group">
                                    <label htmlFor="score" className="form-label">Score (0-100)</label>
                                    <input id="score" name="score" type="number" required min="0" max="100" step="1" className="input input-responsive" defaultValue={defaultValues.score} ref={progressScoreRef} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date" className="form-label">Date</label>
                                    <input id="date" name="date" type="date" required className="input input-responsive" defaultValue={defaultValues.date} ref={progressDateRef} />
                                </div>
                            </div>
                             <div className="form-group">
                                <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                                <textarea id="notes" name="notes" rows={3} className="input input-responsive" defaultValue={defaultValues.notes} ref={progressNotesRef}></textarea>
                            </div>
                              {error && <p className="form-error mt-2 text-sm">{error}</p>}
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={closeModal} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 btn-responsive">Cancel</button>
                            <button type="submit" className="btn btn-primary btn-responsive">{isEditingProgress ? 'Save Changes' : 'Add Record'}</button>
                        </div>
                    </form>
                );
             }
            case 'viewProgress': {
                const studentToView = modalState.data as Student | undefined;
                if (!studentToView) {
                    console.error("Missing student data for view progress modal");
                    return <p className="text-red-500 dark:text-red-400 p-4">Error: Student data not found. Please close and try again.</p>;
                }

                // Get progress records directly from the current state
                const studentProgress = progressRecords
                    .filter(p => p.studentId === studentToView.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first for table

                const chartData = studentProgress
                    .map(p => ({ name: p.assignmentName, score: p.score, date: new Date(p.date).getTime() }))
                    .sort((a, b) => a.date - b.date); // Sort oldest first for line chart

                return (
                     <div className="flex flex-col h-full">
                         <div className="modal-header">
                             <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                               Progress for {studentToView.name} ({studentToView.gradeLevel})
                             </h3>
                              <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                             </button>
                         </div>
                         <div className="mt-2 flex-grow overflow-y-auto pr-2">
                             {/* Progress Chart */}
                             {chartData.length > 1 ? (
                                 <div className="mb-6 h-60 sm:h-64">
                                     <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-slate-300">Score Trend</h4>
                                     <ResponsiveContainer width="100%" height="100%">
                                         <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-base)" strokeOpacity={0.2} />
                                             <XAxis
                                                dataKey="date"
                                                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                stroke="var(--color-text-base)"
                                                tick={{ fontSize: 10 }}
                                                angle={-30}
                                                textAnchor="end"
                                                height={40}
                                             />
                                             <YAxis domain={[0, 100]} stroke="var(--color-text-base)" tick={{ fontSize: 10 }}/>
                                             <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-text-base)', color: 'var(--color-text-base)', borderRadius: 'var(--radius-md)' }}
                                                labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                                                formatter={(value: number, name: string, props: any) => [`${value}% on ${props.payload.name}`, undefined]} // Show score and assignment name
                                             />
                                             {/* Removed Legend <Legend wrapperStyle={{ fontSize: '12px' }}/> */}
                                             <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} name="Score" dot={{r: 3}} />
                                         </LineChart>
                                     </ResponsiveContainer>
                                 </div>
                             ) : (
                                 <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{chartData.length === 1 ? 'Add one more record to see a trend chart.' : 'No progress records with scores yet.'}</p>
                             )}

                             {/* Progress Table */}
                             <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-slate-300">Records</h4>
                             {studentProgress.length > 0 ? (
                                <div className="table-container max-h-72 overflow-y-auto border dark:border-slate-600 rounded-md">
                                    <table className="table">
                                        <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="table-header py-2 px-3 whitespace-nowrap">Date</th>
                                            <th className="table-header py-2 px-3">Assignment</th>
                                            <th className="table-header py-2 px-3 text-right whitespace-nowrap">Score</th>
                                            <th className="table-header py-2 px-3">Notes</th>
                                            <th className="table-header py-2 px-3 text-right">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                                        {studentProgress.map(record => (
                                            <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                                <td className="table-cell py-2 px-3 whitespace-nowrap text-sm">{formatIsoDate(record.date)}</td>
                                                <td className="table-cell py-2 px-3 text-sm">{record.assignmentName}</td>
                                                <td className="table-cell py-2 px-3 text-right text-sm">{record.score}%</td>
                                                <td className="table-cell py-2 px-3 text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate" title={record.notes}>{record.notes || '-'}</td>
                                                <td className="table-cell py-2 px-3 text-right whitespace-nowrap">
                                                     <button
                                                        onClick={() => openModal('editProgress', record)} // Pass the record data
                                                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1" // Reduced padding
                                                        aria-label={`Edit progress record for ${record.assignmentName}`}
                                                        title="Edit Record"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProgress(record.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 ml-1" // Reduced margin
                                                        aria-label={`Delete progress record for ${record.assignmentName}`}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                             ) : (
                                <p className="text-sm text-gray-500 dark:text-slate-400 py-4 text-center">No progress records found for this student.</p>
                             )}
                         </div>
                         <div className="modal-footer mt-4">
                             <button
                                type="button"
                                onClick={() => openModal('addProgress', studentToView)} // Re-use openModal
                                className="btn btn-secondary btn-responsive mr-auto flex items-center gap-1"
                             >
                                 <Plus size={16}/> Add New Record
                             </button>
                            <button type="button" onClick={closeModal} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 btn-responsive">
                                Close
                            </button>
                         </div>
                     </div>
                );
             }
             case 'settings': {
                return (
                     <div className="flex flex-col h-full">
                         <div className="modal-header">
                             <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                                 Settings & Data Management
                             </h3>
                             <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                             </button>
                         </div>
                          {error && <p className="form-error my-3 text-sm bg-red-100 dark:bg-red-900 p-2 rounded border border-red-300 dark:border-red-700">{error}</p>}
                         <div className="mt-4 space-y-6 flex-grow">
                             <div>
                                 <h4 className="text-md font-medium mb-1 text-gray-700 dark:text-slate-300">Export Data</h4>
                                 <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Save a backup of all student and progress data to a JSON file.</p>
                                 <button onClick={handleExportData} className="btn btn-secondary btn-responsive flex items-center gap-2">
                                     <Download size={16} /> Export Backup
                                 </button>
                             </div>
                              <hr className="border-gray-200 dark:border-slate-700"/>
                             <div>
                                 <h4 className="text-md font-medium mb-1 text-gray-700 dark:text-slate-300">Import Data</h4>
                                 <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                                     Import data from a previously exported JSON backup file.
                                     <strong className="text-red-600 dark:text-red-400 block mt-1">Warning: This will replace all current data.</strong>
                                 </p>
                                 <label htmlFor="import-file" className="btn bg-yellow-500 hover:bg-yellow-600 text-yellow-900 btn-responsive flex items-center gap-2 cursor-pointer">
                                     <Upload size={16} /> Import from Backup
                                 </label>
                                 <input
                                     id="import-file"
                                     type="file"
                                     accept=".json,application/json"
                                     className="hidden"
                                     onChange={handleImportData}
                                     aria-label="Import data from backup file"
                                 />
                             </div>
                         </div>
                          <div className="modal-footer">
                            <button type="button" onClick={closeModal} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 btn-responsive">
                                Close
                            </button>
                         </div>
                     </div>
                );
            }
            default:
                return null;
        }
    };

    // ========= JSX RETURN =========
    if (isLoading) {
        return (
            <div className="flex-center min-h-screen bg-gray-100 dark:bg-slate-900">
                {/* Basic loading indicator */}
                <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400">
                    <GraduationCap className="animate-pulse h-6 w-6"/>
                    <span>Loading student data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col theme-transition-bg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100`}>
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-all">
                <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Side: Logo/Title */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400" />
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">Student Progress</h1>
                        </div>

                        {/* Right Side: Search, Actions, Theme Toggle */}
                        <div className="flex items-center gap-2 sm:gap-3">
                             {/* Search Input - Visible on larger screens */}
                            <div className="relative hidden md:block">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="search"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="input input-sm pl-10 py-1.5 rounded-full w-40 lg:w-64 focus:ring-primary-500 focus:border-primary-500"
                                    aria-label="Search students by name"
                                />
                            </div>

                            <button
                                onClick={() => openModal('addStudent')}
                                className="btn btn-primary btn-sm flex-center gap-1 px-2 sm:px-3 py-1.5 rounded-md"
                                aria-label="Add new student"
                                title="Add New Student"
                            >
                                <UserPlus size={16} />
                                <span className="hidden sm:inline">Add</span>
                                <span className="hidden lg:inline ml-1">Student</span>
                            </button>

                             <button
                                onClick={() => openModal('settings')}
                                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 btn-sm flex-center p-1.5 rounded-md"
                                aria-label="Settings and Data Management"
                                title="Settings & Data"
                            >
                                <Settings size={18} />
                            </button>

                            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                        </div>
                    </div>
                     {/* Search Input for smaller screens (below header) */}
                     <div className="relative md:hidden pb-3 pt-1">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pt-1">
                            <Search size={18} className="text-gray-400" />
                         </div>
                         <input
                            type="search"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="input input-sm w-full pl-10 py-1.5 rounded-full focus:ring-primary-500 focus:border-primary-500"
                            aria-label="Search students by name"
                         />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container-wide mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* Filters Row */}
                 <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                     <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-200">Student List</h2>
                     <div className="flex items-center gap-2">
                         <label htmlFor="gradeFilter" className="text-sm font-medium text-gray-600 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
                             <Filter size={14} /> Grade:
                         </label>
                         <select
                             id="gradeFilter"
                             value={filterGrade}
                             onChange={handleFilterChange}
                             className="input input-sm py-1 pr-7 rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500"
                             aria-label="Filter students by grade level"
                         >
                             <option value="">All</option>
                             {uniqueGradeLevels.map(grade => (
                                 <option key={grade} value={grade}>{grade}</option>
                             ))}
                         </select>
                     </div>
                 </div>

                {/* Student Table */}
                <div className="table-container shadow-md rounded-lg border border-gray-200 dark:border-slate-700 theme-transition-all">
                    <table className="table">
                        <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-cell px-4 py-2 sm:px-6 sm:py-3 group cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-150" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">Name {renderSortIcon('name')}</div>
                                </th>
                                <th scope="col" className="table-cell px-4 py-2 sm:px-6 sm:py-3 group cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-150" onClick={() => handleSort('gradeLevel')}>
                                    <div className="flex items-center">Grade {renderSortIcon('gradeLevel')}</div>
                                </th>
                                <th scope="col" className="table-cell px-4 py-2 sm:px-6 sm:py-3 group cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-150 hidden md:table-cell" onClick={() => handleSort('createdAt')}>
                                     <div className="flex items-center">Date Added {renderSortIcon('createdAt')}</div>
                                </th>
                                <th scope="col" className="table-cell px-4 py-2 sm:px-6 sm:py-3 group cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-150 text-center" onClick={() => handleSort('progressCount')}>
                                     <div className="flex items-center justify-center">Records {renderSortIcon('progressCount')}</div>
                                </th>
                                <th scope="col" className="table-cell px-4 py-2 sm:px-6 sm:py-3 text-right whitespace-nowrap">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-all">
                            {filteredAndSortedStudents.length > 0 ? (
                                filteredAndSortedStudents.map((student, index) => (
                                    <tr key={student.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition-bg ${index % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-slate-800/50'}`}>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{student.name}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">{student.gradeLevel}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 text-gray-500 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">{formatDate(student.createdAt)}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 text-gray-500 dark:text-slate-400 text-center">{getProgressCountForStudent(student.id)}</td>
                                        <td className="table-cell px-4 py-3 sm:px-6 sm:py-4 text-right whitespace-nowrap space-x-1 sm:space-x-2">
                                            <button
                                                onClick={() => openModal('viewProgress', student)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-150"
                                                aria-label={`View progress for ${student.name}`}
                                                title="View Progress"
                                            >
                                                <BookOpen size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('editStudent', student)}
                                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors duration-150"
                                                aria-label={`Edit student ${student.name}`}
                                                 title="Edit Student"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-150"
                                                aria-label={`Delete student ${student.name}`}
                                                 title="Delete Student"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="table-cell text-center py-10 text-gray-500 dark:text-slate-400">
                                        {students.length === 0 ? "No students added yet. Click 'Add Student' to start." : "No students match your search/filter criteria."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

             {/* Footer */}
            <footer className="bg-gray-100 dark:bg-slate-900/50 text-center py-4 mt-auto theme-transition-all border-t border-gray-200 dark:border-slate-700/50">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                    Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
                </p>
            </footer>

            {/* Modal */}
            {modalState.type && (
                 <div
                    className="modal-backdrop fade-in flex items-center justify-center p-4"
                    onClick={closeModal} // Close on backdrop click
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title" // Assumes modal content always includes an h3 with this id
                >
                     <div
                         className="modal-content theme-transition-all slide-in w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" // Adjusted max-width, height and flex
                         onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                         role="document"
                     >
                         {/* Content is rendered inside the modal structure now */}
                         {renderModalContent()}
                     </div>
                 </div>
            )}
        </div>
    );
};

export default App;
