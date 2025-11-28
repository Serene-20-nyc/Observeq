document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Mock Data Storage ---
    const mockData = {
        classes: [
            { id: 'CSE-3A', name: 'Computer Science 3A' },
            { id: '10-B', name: 'Grade 10 - Section B' },
            { id: 'M-1A', name: 'Math Elective 1A' }
        ],
        students: [
            { id: 1, name: 'Aarav Kumar', rollNo: 'CS001', classId: 'CSE-3A', engagement: 85, distraction: 15, status: 'Attentive' },
            { id: 2, name: 'Bela Sinha', rollNo: 'CS002', classId: 'CSE-3A', engagement: 45, distraction: 55, status: 'Needs Attention' },
            { id: 3, name: 'Chirag Patel', rollNo: 'CS003', classId: 'CSE-3A', engagement: 92, distraction: 8, status: 'Attentive' },
            { id: 4, name: 'Deepa Verma', rollNo: 'CS004', classId: 'CSE-3A', engagement: 68, distraction: 32, status: 'Needs Attention' },
            { id: 5, name: 'Esha Gupta', rollNo: '10B05', classId: '10-B', engagement: 30, distraction: 70, status: 'Distracted' },
            { id: 6, name: 'Fahad Ali', rollNo: '10B06', classId: '10-B', engagement: 88, distraction: 12, status: 'Attentive' },
            { id: 7, name: 'Geeta Menon', rollNo: 'M1A07', classId: 'M-1A', engagement: 75, distraction: 25, status: 'Attentive' },
        ],
        sessions: [
            { id: 101, title: 'Lecture 5: Data Structures', classId: 'CSE-3A', date: '2025-11-20', status: 'Completed', avgEngagement: 72, avgDistraction: 28, students: [1, 2, 3, 4] },
            { id: 102, title: 'Algebra Practice', classId: '10-B', date: '2025-11-19', status: 'Completed', avgEngagement: 65, avgDistraction: 35, students: [5, 6] },
            { id: 103, title: 'Calculus Introduction', classId: 'M-1A', date: '2025-11-21', status: 'Processing', avgEngagement: 0, avgDistraction: 0, students: [7] },
        ],
        analyticsData: {
            daily: {
                engagement: [75, 78, 80, 72, 85, 79, 81],
                distraction: [25, 22, 20, 28, 15, 21, 19],
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            weekly: {
                engagement: [80, 75, 82, 70],
                distraction: [20, 25, 18, 30],
                labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']
            },
            monthly: {
                engagement: [78, 81, 75],
                distraction: [22, 19, 25],
                labels: ['Sep', 'Oct', 'Nov']
            }
        },
        team: [
            { name: 'Dr. Priya Sharma', role: 'AI Engineer', description: 'Leads our machine learning and vision models.' },
            { name: 'Sameer Khan', role: 'Product Lead', description: 'Focuses on UX/UI and teacher adoption strategy.' },
            { name: 'Alex Wong', role: 'Data Scientist', description: 'Architects the reporting and analytics engine.' }
        ]
    };

    let currentFilterClass = mockData.classes[0].id;
    let currentAnalyticsTab = 'daily';

    // --- 2. Utility Functions ---
    const getInitials = (name) => name.split(' ').map(n => n[0]).join('');
    const getStudentData = (id) => mockData.students.find(s => s.id === id);

    // Function to get status class for table styling
    const getStatusClass = (status) => {
        switch (status) {
            case 'Attentive': return 'status-attentive';
            case 'Needs Attention': return 'status-needs-attention';
            case 'Distracted': return 'status-distracted';
            default: return '';
        }
    };

    const getIndicatorColor = (score) => {
        if (score >= 60) return 'indicator-green'; // Engaged
        if (score >= 30) return 'indicator-yellow'; // Needs Attention
        return 'indicator-red'; // Distracted
    }

    // --- 3. Rendering Functions ---

    // Populates dropdowns with classes
    const populateClassDropdowns = () => {
        const dropdowns = [
            document.getElementById('class-select-filter'),
            document.getElementById('student-class'),
            document.getElementById('session-class'),
            document.getElementById('analytics-class-filter')
        ];

        dropdowns.forEach(select => {
            // Clear existing options
            select.innerHTML = '';
            
            // Add initial "All Classes" option for filters
            if (select.id.includes('filter') || select.id.includes('analytics')) {
                const allOption = document.createElement('option');
                allOption.value = 'all';
                allOption.textContent = 'All Classes';
                select.appendChild(allOption);
            } else {
                 const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'Select Class...';
                placeholder.disabled = true;
                placeholder.selected = true;
                select.appendChild(placeholder);
            }

            mockData.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                select.appendChild(option);
            });
            // Set the first class as default selected for the main filter
            if (select.id === 'class-select-filter' && mockData.classes.length > 0) {
                 select.value = currentFilterClass;
            }
        });
    };

    // Renders the Student Table for the currently selected class
    const renderStudentTable = (classId) => {
        const tbody = document.querySelector('#students-table tbody');
        tbody.innerHTML = '';

        const filteredStudents = classId === 'all'
            ? mockData.students
            : mockData.students.filter(s => s.classId === classId);

        if (filteredStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No students found for this class.</td></tr>`;
            return;
        }

        filteredStudents.forEach(student => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><div class="student-avatar">${getInitials(student.name)}</div></td>
                <td>${student.name}</td>
                <td>${student.rollNo}</td>
                <td>${student.engagement}%</td>
                <td>${student.distraction}%</td>
                <td><span class="status-badge ${getStatusClass(student.status)}">${student.status}</span></td>
            `;
        });
    };

    // Renders the Dashboard Summary Cards
    const renderDashboardSummary = () => {
        const totalSessions = mockData.sessions.filter(s => s.status === 'Completed').length;
        const totalStudents = mockData.students.length;
        const avgEngagement = (mockData.sessions.reduce((sum, s) => sum + s.avgEngagement, 0) / totalSessions).toFixed(1) || 0;
        const avgDistraction = (mockData.sessions.reduce((sum, s) => sum + s.avgDistraction, 0) / totalSessions).toFixed(1) || 0;

        const cardsContainer = document.getElementById('dashboard-summary-cards');
        cardsContainer.innerHTML = `
            <div class="card summary-card">
                <i class="fas fa-video fa-2x"></i>
                <h4>Total Sessions Analyzed</h4>
                <p>${totalSessions}</p>
            </div>
            <div class="card summary-card">
                <i class="fas fa-smile-beam fa-2x text-success"></i>
                <h4>Avg. Engagement Score</h4>
                <p>${avgEngagement}%</p>
            </div>
            <div class="card summary-card">
                <i class="fas fa-frown fa-2x text-danger"></i>
                <h4>Avg. Distraction Index</h4>
                <p>${avgDistraction}%</p>
            </div>
            <div class="card summary-card">
                <i class="fas fa-user-graduate fa-2x"></i>
                <h4>Students Monitored</h4>
                <p>${totalStudents}</p>
            </div>
        `;

        // Today's Highlights (Top 5 Most Distracted Overall)
        const topDistracted = [...mockData.students]
            .sort((a, b) => b.distraction - a.distraction)
            .slice(0, 5);

        const highlightsList = document.getElementById('todays-highlights-list');
        highlightsList.innerHTML = '';
        topDistracted.forEach(student => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${student.name} (${mockData.classes.find(c => c.id === student.classId).name})</span>
                <span class="distraction-score">${student.distraction}%</span>
            `;
            highlightsList.appendChild(li);
        });
    };

    // Renders the Sessions List Table
    const renderSessionsTable = () => {
        const tbody = document.querySelector('#sessions-table tbody');
        tbody.innerHTML = '';

        mockData.sessions.forEach(session => {
            const statusClass = session.status === 'Completed' ? 'status-completed' : 'status-processing';
            const classText = mockData.classes.find(c => c.id === session.classId).name;

            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${session.title}</td>
                <td>${classText}</td>
                <td>${session.date}</td>
                <td><span class="status-badge ${statusClass}">${session.status}</span></td>
                <td>
                    ${session.status === 'Completed' ?
                        `<button class="btn btn-primary-outline btn-sm view-report-btn" data-session-id="${session.id}">View Report</button>
                         <button class="btn btn-secondary btn-sm"><i class="fas fa-file-download"></i> Download PDF</button>` :
                        `<button class="btn btn-secondary-outline btn-sm" disabled>View Report</button>`
                    }
                </td>
            `;
        });
        attachReportViewListeners();
    };

    // Renders the team cards for About Us
    const renderTeamCards = () => {
        const container = document.getElementById('team-cards-container');
        container.innerHTML = '';

        mockData.team.forEach(member => {
            const card = document.createElement('div');
            card.classList.add('team-card');
            card.innerHTML = `
                <div class="team-avatar">${getInitials(member.name)}</div>
                <h4>${member.name}</h4>
                <p><strong>${member.role}</strong></p>
                <p>${member.description}</p>
            `;
            container.appendChild(card);
        });
    };

    // Renders the Analytics Charts (CSS-based bar charts)
    const renderAnalyticsCharts = (tab) => {
        const data = mockData.analyticsData[tab];
        if (!data) return;

        // Engagement Chart
        const engagementBarsContainer = document.getElementById('engagement-bars');
        engagementBarsContainer.innerHTML = '';
        data.engagement.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.style.height = `${value}%`;
            bar.style.backgroundColor = getIndicatorColor(value) === 'indicator-green' ? 'var(--primary-color)' : 'var(--warning-color)';
            bar.innerHTML = `<span class="bar-value">${value}%</span><span class="bar-label">${data.labels[index]}</span>`;
            engagementBarsContainer.appendChild(bar);
        });

        // Distraction Chart
        const distractionBarsContainer = document.getElementById('distraction-bars');
        distractionBarsContainer.innerHTML = '';
        data.distraction.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            // Distraction height is scaled to look good, 100% max distraction is too big
            bar.style.height = `${value * 1.5}%`; 
            bar.style.backgroundColor = getIndicatorColor(100 - value) === 'indicator-red' ? 'var(--danger-color)' : 'var(--secondary-color)';
            bar.innerHTML = `<span class="bar-value">${value}%</span><span class="bar-label">${data.labels[index]}</span>`;
            distractionBarsContainer.appendChild(bar);
        });

        // Update summary cards for the tab/period (mock data)
        if (tab === 'daily') {
            document.getElementById('most-improved-student').textContent = 'Amit Sharma (Class 10-B)';
            document.getElementById('most-distracted-period').textContent = '2:00 PM - 3:00 PM (Post-Lunch)';
        } else if (tab === 'weekly') {
            document.getElementById('most-improved-student').textContent = 'Chirag Patel (Class CSE-3A)';
            document.getElementById('most-distracted-period').textContent = 'Tuesday Morning (8 AM - 10 AM)';
        } else {
            document.getElementById('most-improved-student').textContent = 'Geeta Menon (Class M-1A)';
            document.getElementById('most-distracted-period').textContent = 'October Month';
        }
    };

    // --- 4. Event Listeners & Logic ---

    // Navbar Toggle (Mobile Hamburger)
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.querySelector('i').classList.toggle('fa-bars');
        hamburger.querySelector('i').classList.toggle('fa-times');
    });

    // Close mobile nav on link click (smooth scroll)
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Check if it's an internal scroll link
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                navMenu.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');

                const targetId = link.getAttribute('href').substring(1);
                document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Classes & Students: Class Filter Change
    document.getElementById('class-select-filter').addEventListener('change', (e) => {
        currentFilterClass = e.target.value;
        renderStudentTable(currentFilterClass);
    });

    // Add Student Modal Logic
    const studentModal = document.getElementById('add-student-modal');
    const addStudentBtn = document.getElementById('add-student-btn');
    const studentModalClose = studentModal.querySelector('.close-btn');
    const addStudentForm = document.getElementById('add-student-form');
    const studentFormMessage = document.getElementById('student-form-message');

    addStudentBtn.addEventListener('click', () => {
        studentModal.style.display = 'block';
        studentFormMessage.style.display = 'none';
        addStudentForm.reset(); // Clear form on open
    });

    studentModalClose.addEventListener('click', () => {
        studentModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            studentModal.style.display = 'none';
        }
    });

    addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('student-name').value;
        const roll = document.getElementById('student-roll').value;
        const classId = document.getElementById('student-class').value;
        // Basic validation
        if (!name || !roll || !classId) {
            studentFormMessage.textContent = 'Please fill in all required fields.';
            studentFormMessage.className = 'form-message form-error';
            studentFormMessage.style.display = 'block';
            return;
        }

        // Add dummy new student to mock data (for demonstration)
        const newStudentId = mockData.students.length + 1;
        const newStudent = {
            id: newStudentId,
            name: name,
            rollNo: roll,
            classId: classId,
            engagement: 70, // Default values
            distraction: 30,
            status: 'Attentive'
        };
        mockData.students.push(newStudent);

        // Show success message
        studentFormMessage.textContent = `Student ${name} added successfully!`;
        studentFormMessage.className = 'form-message form-success';
        studentFormMessage.style.display = 'block';

        // Re-render the student table after a short delay
        setTimeout(() => {
            renderStudentTable(currentFilterClass);
            addStudentForm.reset();
            studentModal.style.display = 'none';
        }, 1500);
    });

    // Sessions & Reports: Upload & analysis integration
    const newSessionForm = document.getElementById('new-session-form');
    const processingArea = document.getElementById('processing-area');
    const progressBar = document.getElementById('analysis-progress-bar');
    const processingMessage = document.getElementById('processing-message');
    const viewReportBtn = document.getElementById('view-report-btn');

    newSessionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('session-title').value;
        const classId = document.getElementById('session-class').value;
        const date = document.getElementById('session-date').value;
        const videoInput = document.getElementById('session-video');

        if (!videoInput || !videoInput.files || videoInput.files.length === 0) {
            processingArea.style.display = 'block';
            progressBar.style.width = '0%';
            viewReportBtn.style.display = 'none';
            processingMessage.textContent = 'Please select a video file to upload.';
            return;
        }

        // Show processing UI
        processingArea.style.display = 'block';
        progressBar.style.width = '10%';
        viewReportBtn.style.display = 'none';
        processingMessage.textContent = 'Uploading video and starting analysis...';
        newSessionForm.style.display = 'none';

        const formData = new FormData();
        formData.append('title', title || 'Session');
        formData.append('class_name', classId || '');
        if (date) {
            formData.append('date', date);
        }
        formData.append('video', videoInput.files[0]);

        try {
            const res = await fetch('/api/upload-session', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
                progressBar.style.width = '0%';
                processingMessage.textContent = (data && data.error) ? data.error : 'Upload failed. Please try again.';
                return;
            }

            // Mark as complete in UI
            progressBar.style.width = '100%';
            processingMessage.textContent = 'Analysis complete!';
            viewReportBtn.style.display = 'block';

            if (data.report_url) {
                viewReportBtn.onclick = () => {
                    window.open(data.report_url, '_blank');
                };
            }
        } catch (err) {
            progressBar.style.width = '0%';
            processingMessage.textContent = 'Network error. Please try again.';
        }
    });

    // Function to render and show the Session Report View
    const showSessionReport = (sessionId) => {
        const session = mockData.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Hide Session List, Show Report View
        document.getElementById('sessions-table').closest('.panel-container').style.display = 'none';
        const reportView = document.getElementById('session-report-view');
        reportView.style.display = 'block';
        
        // Populate Report Header
        document.getElementById('report-session-title').textContent = `Session Report: ${session.title} (${mockData.classes.find(c => c.id === session.classId).name})`;

        // Populate Report Summary Cards
        document.getElementById('report-summary-cards').innerHTML = `
            <div class="card summary-card">
                <i class="fas fa-calendar-alt fa-2x"></i>
                <h4>Date</h4>
                <p>${session.date}</p>
            </div>
            <div class="card summary-card">
                <i class="fas fa-smile-beam fa-2x text-success"></i>
                <h4>Average Engagement</h4>
                <p>${session.avgEngagement}%</p>
            </div>
            <div class="card summary-card">
                <i class="fas fa-frown fa-2x text-danger"></i>
                <h4>Average Distraction</h4>
                <p>${session.avgDistraction}%</p>
            </div>
        `;

        // Populate Report Student Table
        const studentTableBody = document.querySelector('#report-students-table tbody');
        studentTableBody.innerHTML = '';
        const reportStudents = mockData.students.filter(s => session.students.includes(s.id));
        
        // Sort students for the Top list
        const sortedReportStudents = [...reportStudents].sort((a, b) => b.distraction - a.distraction);
        const topDistractedList = document.getElementById('top-distracted-list');
        topDistractedList.innerHTML = '';
        
        sortedReportStudents.forEach((student, index) => {
            const statusClass = getStatusClass(student.status);
            const indicatorColor = getIndicatorColor(student.engagement);
            
            // Main table row
            const row = studentTableBody.insertRow();
            row.innerHTML = `
                <td>${student.name}</td>
                <td><span class="status-indicator ${indicatorColor}"></span> ${student.engagement}%</td>
                <td>${student.distraction}%</td>
                <td>
                    <span class="status-badge ${statusClass}">${student.status}</span>
                    <button class="btn btn-secondary-outline btn-sm" style="margin-left: 10px;">Download Individual PDF (Dummy)</button>
                </td>
            `;
            
            // Top list item (only first 10)
            if (index < 10) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${student.name}</span>
                    <span class="distraction-score">${student.distraction}%</span>
                `;
                topDistractedList.appendChild(li);
            }
        });
    };

    // Attach listener to sessions table for View Report buttons (since they are dynamic)
    const attachReportViewListeners = () => {
        document.querySelectorAll('.view-report-btn').forEach(button => {
            button.onclick = (e) => {
                const sessionId = parseInt(e.target.dataset.sessionId, 10);
                showSessionReport(sessionId);
            };
        });
    };

    // Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    const contactFormMessage = document.getElementById('contact-form-message');

    const isValidEmail = (email) => {
        // Simple regex for email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (contactForm && contactFormMessage) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const institution = document.getElementById('contact-institution').value;
            const role = document.getElementById('contact-role').value;
            const message = document.getElementById('contact-message').value;

            // Basic validation
            if (!name || !email || !message) {
                contactFormMessage.textContent = 'Please fill in your name, email, and message.';
                contactFormMessage.className = 'form-message form-error';
                contactFormMessage.style.display = 'block';
                return;
            }

            if (!isValidEmail(email)) {
                contactFormMessage.textContent = 'Please enter a valid email address.';
                contactFormMessage.className = 'form-message form-error';
                contactFormMessage.style.display = 'block';
                return;
            }

            try {
                const body = new URLSearchParams();
                body.append('full_name', name);
                body.append('email', email);
                if (institution) body.append('institution', institution);
                if (role) body.append('role', role);
                body.append('message', message);

                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body
                });

                const data = await res.json();

                if (!res.ok || !data.ok) {
                    contactFormMessage.textContent = (data && data.error) ? data.error : 'Submission failed. Please try again.';
                    contactFormMessage.className = 'form-message form-error';
                    contactFormMessage.style.display = 'block';
                    return;
                }

                contactFormMessage.textContent = 'Thanks for reaching out! Our team will respond within 24 hours.';
                contactFormMessage.className = 'form-message form-success';
                contactFormMessage.style.display = 'block';
                contactForm.reset();

                setTimeout(() => {
                    contactFormMessage.style.display = 'none';
                }, 5000);
            } catch (err) {
                contactFormMessage.textContent = 'Network error. Please try again.';
                contactFormMessage.className = 'form-message form-error';
                contactFormMessage.style.display = 'block';
            }
        });
    }

    // --- 5. Initial Rendering on Load ---
    populateClassDropdowns();
    renderDashboardSummary();
    renderStudentTable(currentFilterClass);
    renderSessionsTable();
    renderAnalyticsCharts(currentAnalyticsTab);
    renderTeamCards();
});