const extensionConfig = {
    API_ENDPOINT: "https://practiceapi.geeksforgeeks.org/api/v1/institute/2065/students/stats?page_size=10&page=2",
    BACKEND_ENDPOINT: "http://localhost:5000/api/v1"
};

const apiPaths = {
    student: {
        getFullnamesByIds: "student/list" // usage either /student/list?studentIds=2&studentIds=3 or /student/list?studentIds=[1,2,3,4] 
    }
}

class StudentListInterceptor {
    apiUrl;
    studentList = null;
    instituteId;
    originalFetch;

    constructor() {
        this.originalFetch = window.fetch.bind(window);
        this.apiUrl = extensionConfig.API_ENDPOINT;
    }

    notifyAboutPayload(studentData = this.studentList) {
        window.postMessage({
            source: "gfg-extension",
            type: "GFG_STUDENTS",
            payload: studentData,
            instituteId: this.instituteId
        }, "*");
    }

    async getFullNames() {
        const serializedIdList = this.studentList.results.map(
            s => "studentIds=" + s.user_id.toString()
        ).join("&");
        const endpoint = `${extensionConfig.BACKEND_ENDPOINT}/${apiPaths.student.getFullnamesByIds}?${serializedIdList}`;
        const res = await this.originalFetch(endpoint);
        const { data: studentList } = (await res.json());

        this.studentList.results = this.studentList.results.map(student => {
            const matchingStudent = studentList?.find(s => s.$id === student.user_id.toString());
            student.fullName = matchingStudent?.name || "Unknown";
            return student;
        });
    }

    // Method 1: Intercept the browser's request.
    async interceptStudentList() {
        const originalFetch = this.originalFetch;

        window.fetch = async (...args) => {
            const req = args[0];

            const url = req instanceof Request
                ? req.url
                : String(req);

            const response = await originalFetch(...args);


            if (url.includes("/students/stats")) {
                this.instituteId = url.split("/")[6].trim();
                try {
                    const data = await response.clone().json();
                    this.studentList = data;
                    await this.getFullNames();
                    this.notifyAboutPayload();
                } catch (err) {
                    console.error(err);
                }
            }

            return response;
        }
    }

    // Fallback after 1.
    // Method 2: Fetch the payload by ourselves.
    async getStudentList() {
        if (this.studentList)
            return this.studentList;

        try {
            const res = await this.originalFetch(this.apiUrl);
            const studentData = await res.json();

            this.studentList = studentData;
            await this.getFullNames();
            this.notifyAboutPayload();

            return studentData;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}


(async () => {
    const interceptorInstance =
        new StudentListInterceptor();

    await interceptorInstance.interceptStudentList();
    setTimeout(() => interceptorInstance.getStudentList(), 3000);
})();