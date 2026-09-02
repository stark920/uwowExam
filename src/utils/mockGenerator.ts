import type { DataRecord } from '../types';

const FIRST_NAMES = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia',
  'James', 'Ava', 'William', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia',
  'Henry', 'Evelyn', 'Theodore', 'Harper', 'Alexander', 'Luna', 'Sebastian', 'Camila',
  'Mateo', 'Gianna', 'Daniel', 'Elizabeth', 'Jack', 'Eleanor', 'Ethan', 'Ella',
  'Kenji', 'Yuki', 'Mei-Ling', 'Chen', 'Siddharth', 'Priya', 'Aarav', 'Ananya',
  'Mateo', 'Sofia', 'Dmitri', 'Natasha', 'Lucas', 'Chloe', 'Kai', 'Zara'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Takahashi', 'Watanabe', 'Tanaka', 'Zhang', 'Wang', 'Patel', 'Sharma', 'Gupta',
  'Ivanov', 'Popov', 'Dubois', 'Leroy', 'Mueller', 'Schmidt', 'Silva', 'Santos'
];

const POSITIONS = [
  'Senior Frontend Architect', 'Full Stack Engineer', 'Backend Specialist',
  'DevOps Lead', 'Product Designer', 'Data Platform Engineer',
  'Security Operations Analyst', 'Engineering Manager', 'AI Systems Researcher',
  'Cloud Solutions Architect', 'QA Automation Lead', 'Mobile Apps Developer',
  'Site Reliability Engineer', 'Database Administrator', 'Technical Product Manager'
];

const LOCATIONS = [
  'San Francisco, US', 'New York, US', 'Seattle, US', 'Austin, US',
  'London, UK', 'Berlin, Germany', 'Amsterdam, Netherlands', 'Paris, France',
  'Tokyo, Japan', 'Singapore, SG', 'Sydney, Australia', 'Toronto, Canada',
  'Stockholm, Sweden', 'Zurich, Switzerland', 'Seoul, South Korea'
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(startYear = 2018, endYear = 2025): string {
  const year = getRandomInt(startYear, endYear);
  const month = String(getRandomInt(1, 12)).padStart(2, '0');
  const day = String(getRandomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateRecordsBatch(count: number, startingIndex: number): DataRecord[] {
  const records: DataRecord[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const recordIndex = startingIndex + i;
    const paddedId = String(recordIndex).padStart(6, '0');
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);

    records.push({
      id: `REC-${paddedId}`,
      userName: `${firstName} ${lastName}`,
      position: getRandomItem(POSITIONS),
      location: getRandomItem(LOCATIONS),
      age: getRandomInt(21, 62),
      dateStart: getRandomDate(),
      pinnedPosition: null,
      createdAt: now - getRandomInt(1000, 10000000),
      updatedAt: now,
    });
  }

  return records;
}
