const BACKEND_URL = "http://localhost:5000/api/v1"
const apiPaths = {
    student: {
        getFullnamesByIds: "student/list" // usage either /student/list?studentIds=2&studentIds=3 or /student/list?studentIds=[1,2,3,4] 
    },
    institute: {
        getAvailabilityById: (instituteId) => `institute/availability/${instituteId}`
    }
}

/**
     * @param {string} name
     * @param {string} instituteId
     * @returns {Promise<Object[]>}
*/
const findStudentsByFullname = async (name, instituteId) => {
    try {
        const res = await fetch(
            `${BACKEND_URL}/student/search?name=${encodeURIComponent(name)}&instituteId=${instituteId}`
        );
        const { data } = await res.json();
        // Normalize backend shape → intercepted shape for #buildCard.
        return (data ?? []).map(s => ({
            handle: s.username,
            fullName: s.name,
            coding_score: s.score,
            total_problems_solved: s.solved,
            potd_longest_streak: s.streak
        }));
    } catch (err) {
        console.error("[SussyGeek] Search failed:", err);
        return [];
    }
}

// TODO: Add docstring here.
const getFullNamesByIds = async (studentList, originalFetch) => {
    const serializedIdList = studentList.results.map(
        s => "studentIds=" + s.user_id.toString()
    ).join("&");
    const endpoint = `${BACKEND_URL}/${apiPaths.student.getFullnamesByIds}?${serializedIdList}`;
    const res = await originalFetch(endpoint);
    const { data: fetchedStudents } = (await res.json());

    const results = studentList.results.map(student => {
        const matchingStudent = fetchedStudents?.find(s => s.$id === student.user_id.toString());
        student.fullName = matchingStudent?.name || "Unknown";
        return student;
    });

    return results;
}

const findInstituteAvailability = async (instituteId) => {
    const res = await fetch(
        `${BACKEND_URL}/${apiPaths.institute.getAvailabilityById(instituteId)}`
    );
    const { data } = await res.json();
    return data.availability;
}