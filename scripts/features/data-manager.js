// Data Management - Handle gym members data operations
class DataManager {
    constructor() {
        this.allData = [];
        this.filteredData = [];
    }

    async loadGymMembersData() {
        try {
            const response = await fetch("data/gym-members.json");
            const data = await response.json();
            
            this.allData = data.members;
            this.filteredData = [...data.members];
            
            return { success: true, data: this.allData };
        } catch (error) {
            console.error("Error loading gym members data:", error);
            return { success: false, error: error.message };
        }
    }

    async saveMembersToFile() {
        try {
            const response = await fetch('/api/save-members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    members: this.allData
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to save data');
            }

            console.log('Data saved successfully:', result.message);
            return { success: true, data: result };

        } catch (error) {
            console.error('Error saving to file:', error);
            return { success: false, error: error.message };
        }
    }

    addMember(memberData) {
        // Validate member data
        if (!memberData.bookingNo || !memberData.name || !memberData.email) {
            throw new Error('Invalid member data - missing required fields');
        }
        
        // Check for duplicates
        const existingMember = this.findMemberByBookingNo(memberData.bookingNo);
        if (existingMember) {
            throw new Error(`Member with booking number ${memberData.bookingNo} already exists`);
        }
        
        this.allData.unshift(memberData);
        this.filteredData.unshift(memberData);
    }

    removeMember(bookingNo) {
        this.allData = this.allData.filter(member => member.bookingNo !== bookingNo);
        this.filteredData = this.filteredData.filter(member => member.bookingNo !== bookingNo);
    }

    updateMember(bookingNo, updatedData) {
        const memberIndex = this.allData.findIndex(member => member.bookingNo === bookingNo);
        if (memberIndex === -1) {
            throw new Error(`Member with booking number ${bookingNo} not found`);
        }

        // Update the member data
        this.allData[memberIndex] = { ...this.allData[memberIndex], ...updatedData };
        
        // Update filtered data as well
        const filteredIndex = this.filteredData.findIndex(member => member.bookingNo === bookingNo);
        if (filteredIndex !== -1) {
            this.filteredData[filteredIndex] = { ...this.filteredData[filteredIndex], ...updatedData };
        }

        return this.allData[memberIndex];
    }

    findMemberByBookingNo(bookingNo) {
        return this.allData.find(member => member.bookingNo === bookingNo);
    }

    filterData(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredData = [...this.allData];
            return this.filteredData;
        }

        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        this.filteredData = this.allData.filter(member => {
            return this.matchesSearchTerm(member, normalizedSearchTerm);
        });

        return this.filteredData;
    }

    matchesSearchTerm(member, searchTerm) {
        const searchableFields = [
            member.bookingNo,
            member.name,
            member.sex,
            member.age.toString(),
            member.email,
            member.mobile,
            member.lastVisit,
            member.expiryStatus
        ];

        const searchTerms = searchTerm.split(" ").filter(term => term.length > 0);

        return searchTerms.every(term =>
            searchableFields.some(field => field.toLowerCase().includes(term))
        );
    }

    getLastBookingNumber() {
        if (this.allData.length === 0) return '#102112';
        
        const bookingNumbers = this.allData.map(member => 
            parseInt(member.bookingNo.replace('#', ''))
        );
        
        return Math.max(...bookingNumbers);
    }

    generateBookingNumber(lastNumber) {
        const nextNumber = typeof lastNumber === 'string' ? 
            parseInt(lastNumber.replace('#', '')) + 1 : 
            lastNumber + 1;
        return `#${nextNumber}`;
    }
}