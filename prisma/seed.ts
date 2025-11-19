import { ApplicationStatus, InterviewStatus, PrismaClient, ReminderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const hashedPassword = await bcrypt.hash('password', 10);
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const user = await prisma.user.create({
    data: {
      email: 'test@gmail.com',
      username: 'mark',
      password: hashedPassword,
    },
  });

  const company1 = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      website: 'https://www.acmecorp.com',
      street: 'Romanstreet 22',
      city: 'Berlin',
      state: 'Berlin State',
      zipCode: '10176',
      country: 'Germany',
      industry: 'Tech',
      companySize: '20',
      contactName: 'Mrs. Scholz',
      contactEmail: 'scholz@gmail.com',
      contactPhone: '0172/3543543',
      notes:
        'Mid-sized company in the renewable energy sector with a strong focus on sustainability, innovation, and flexible work culture.',
      userId: user.id,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Globex Inc',
      website: 'https://www.globex.com',
      street: 'Wolfstreet 4',
      city: 'Munich',
      state: 'Bavaria',
      zipCode: '80337',
      country: 'Germany',
      industry: 'Finance',
      companySize: '10000',
      contactName: 'Mr. Burns',
      contactEmail: 'burns@gmail.com',
      contactPhone: '0164/234542223',
      notes:
        'Fast-paced marketing agency that values data-driven decision making, creativity, and collaboration across teams.',
      userId: user.id,
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'Initech',
      website: 'https://www.initech.com',
      street: 'Mainstreet 645',
      city: 'Hamburg',
      state: 'Hamburg State',
      zipCode: '20097',
      country: 'Germany',
      industry: 'Software',
      companySize: '650',
      contactName: 'Mr. Meier',
      contactEmail: 'meier@gmail.com',
      contactPhone: '0164/1234567',
      notes:
        'Tech-focused organization developing automation solutions, offering growth opportunities and a supportive engineering culture.',
      userId: user.id,
    },
  });

  const applications = await Promise.all([
    // 1 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'Frontend Developer',
        companyId: company1.id,
        userId: user.id,
        jobLink: 'www.testsite1.com',
        jobDescription: 'Building UI components with React and TypeScript.',
        status: 'APPLIED',
        priority: 1,
        workLocation: 'REMOTE',
        notes: 'Applied via LinkedIn after seeing a referral post.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 160 * day),
              notes: 'Initial application sent.',
            },
          ],
        },
      },
    }),

    // 2 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'Backend Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite2.com',
        jobDescription: 'Node.js microservices and PostgreSQL maintenance.',
        status: 'APPLIED',
        priority: 2,
        workLocation: 'HYBRID',
        notes: 'Recruiter reached out via email.',
        favorited: true,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 8 * day),
              notes: 'Sent tailored CV and cover letter.',
            },
            {
              status: ApplicationStatus.REJECTED,
              date: new Date(now - 2 * day),
            },
          ],
        },
      },
    }),

    // 3 - INTERVIEW (FIRST)
    prisma.application.create({
      data: {
        jobTitle: 'Fullstack Developer',
        companyId: company3.id,
        userId: user.id,
        jobLink: 'www.testsite3.com',
        jobDescription: 'End-to-end development with React and NestJS.',
        status: 'INTERVIEW',
        priority: 1,
        workLocation: 'REMOTE',
        notes: 'Moving forward after coding challenge.',
        favorited: true,
        fileUrls: [],
        logItems: {
          create: (() => {
            const interviewDate = new Date(now - 5 * day);
            return [
              {
                status: ApplicationStatus.APPLIED,
                date: new Date(now - 12 * day),
                notes: 'Initial application submitted.',
              },
              {
                status: ApplicationStatus.INTERVIEW,
                date: interviewDate,
                notes: 'First interview scheduled and completed.',
              },
            ];
          })(),
        },
        interviews: {
          create: (() => {
            const interviewDate = new Date(now - 5 * day);
            return {
              date: interviewDate,
              notes: 'First round: cultural fit and basic tech questions.',
              status: InterviewStatus.DONE,
            };
          })(),
        },
        reminders: {
          create: {
            alarmDate: new Date(now - 2 * day),
            message: 'Send thank-you email and ask for feedback (Fullstack role).',
            status: ReminderStatus.DONE,
          },
        },
      },
    }),

    // 4 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'DevOps Engineer',
        companyId: company1.id,
        userId: user.id,
        jobLink: 'www.testsite4.com',
        jobDescription: 'CI/CD pipelines, AWS infrastructure, monitoring.',
        status: 'APPLIED',
        priority: 3,
        workLocation: 'ON_SITE',
        notes: 'Strong match with Kubernetes experience.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 190 * day),
              notes: 'Application sent via company careers page.',
            },
          ],
        },
      },
    }),

    // 5 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'Data Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite5.com',
        jobDescription: 'Building ETL pipelines and data warehousing.',
        status: 'APPLIED',
        priority: 2,
        workLocation: 'HYBRID',
        notes: 'Need to brush up on SQL window functions.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 4 * day),
              notes: 'Applied with a portfolio of previous data projects.',
            },
            {
              status: ApplicationStatus.REJECTED,
              date: new Date(now - 1 * day),
            },
          ],
        },
      },
    }),

    // 6 - INTERVIEW (SECOND)
    prisma.application.create({
      data: {
        jobTitle: 'Senior Backend Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite6.com',
        jobDescription: 'Designing scalable APIs and leading backend initiatives.',
        status: 'INTERVIEW',
        priority: 1,
        workLocation: 'REMOTE',
        notes: 'Strong interest – great engineering culture.',
        favorited: true,
        fileUrls: [],
        logItems: {
          create: (() => {
            const firstInterviewDate = new Date(now - 9 * day);
            const secondInterviewDate = new Date(now - 2 * day);
            return [
              {
                status: ApplicationStatus.APPLIED,
                date: new Date(now - 15 * day),
                notes: 'Initial application submitted.',
              },
              {
                status: ApplicationStatus.INTERVIEW,
                date: firstInterviewDate,
                notes: 'First interview: system design basics.',
              },
              {
                status: ApplicationStatus.INTERVIEW,
                date: secondInterviewDate,
                notes: 'Second interview: deep dive into architecture decisions.',
              },
            ];
          })(),
        },
        interviews: {
          create: (() => {
            const secondInterviewDate = new Date(now - 2 * day);
            return {
              date: secondInterviewDate,
              notes: 'Second round: architecture and leadership skills.',
              status: InterviewStatus.DONE,
            };
          })(),
        },
        reminders: {
          create: {
            alarmDate: new Date(now - 1 * day),
            message: 'Prepare follow-up email and salary expectations (Senior Backend).',
          },
        },
      },
    }),

    // 7 - DRAFT
    prisma.application.create({
      data: {
        jobTitle: 'Junior Frontend Developer',
        companyId: company1.id,
        userId: user.id,
        jobLink: 'www.testsite7.com',
        jobDescription: 'Working on UI bugs and small features.',
        status: 'DRAFT',
        priority: 3,
        workLocation: 'ON_SITE',
        notes: 'Not sure about growth opportunities yet.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.DRAFT,
              date: new Date(now - 2 * day),
              notes: 'Saved as draft to research company reviews.',
            },
          ],
        },
      },
    }),

    // 8 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'QA Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite8.com',
        jobDescription: 'Manual and automated testing for web apps.',
        status: 'APPLIED',
        priority: 2,
        workLocation: 'HYBRID',
        notes: 'Role includes opportunities to learn automation.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 65 * day),
              notes: 'Application submitted with example test cases.',
            },
          ],
        },
      },
    }),

    // 9 - INTERVIEW (FIRST)
    prisma.application.create({
      data: {
        jobTitle: 'Site Reliability Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite9.com',
        jobDescription: 'Ensuring reliability and observability of services.',
        status: 'INTERVIEW',
        priority: 1,
        workLocation: 'REMOTE',
        notes: 'Interesting incident management culture.',
        favorited: true,
        fileUrls: [],
        logItems: {
          create: (() => {
            const interviewDate = new Date(now - 1 * day);
            return [
              {
                status: ApplicationStatus.APPLIED,
                date: new Date(now - 6 * day),
                notes: 'Applied with SRE-focused CV.',
              },
              {
                status: ApplicationStatus.INTERVIEW,
                date: interviewDate,
                notes: 'First interview: on-call and monitoring discussion.',
              },
            ];
          })(),
        },
        interviews: {
          create: (() => {
            const interviewDate = new Date(now - 1 * day);
            return {
              date: interviewDate,
              notes: 'First round: SLOs, SLIs, and incident response.',
              status: InterviewStatus.DONE,
            };
          })(),
        },
        reminders: {
          create: {
            alarmDate: new Date(now + 360 * day),
            message: 'Gather examples of past incident postmortems (SRE role).',
            status: ReminderStatus.DONE,
          },
        },
      },
    }),

    // 10 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'Product Engineer',
        companyId: company1.id,
        userId: user.id,
        jobLink: 'www.testsite10.com',
        jobDescription: 'Close collaboration with product and design teams.',
        status: 'APPLIED',
        priority: 2,
        workLocation: 'HYBRID',
        notes: 'Very product-focused engineering culture.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 3 * day),
              notes: 'Sent concise product-focused cover letter.',
            },
          ],
        },
      },
    }),

    // 11 - DRAFT
    prisma.application.create({
      data: {
        jobTitle: 'Machine Learning Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite11.com',
        jobDescription: 'ML model training and deployment to production.',
        status: 'DRAFT',
        priority: 3,
        workLocation: 'REMOTE',
        notes: 'Need to finish ML portfolio first.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.DRAFT,
              date: new Date(now - 1 * day),
              notes: 'Draft created, need to adapt CV for ML focus.',
            },
          ],
        },
      },
    }),

    // 12 - INTERVIEW (SECOND)
    prisma.application.create({
      data: {
        jobTitle: 'Senior Fullstack Engineer',
        companyId: company3.id,
        userId: user.id,
        jobLink: 'www.testsite12.com',
        jobDescription: 'Ownership from frontend to backend.',
        status: 'INTERVIEW',
        priority: 1,
        workLocation: 'REMOTE',
        notes: 'Great alignment with career goals.',
        favorited: true,
        fileUrls: [],
        logItems: {
          create: (() => {
            const firstInterviewDate = new Date(now - 11 * day);
            const secondInterviewDate = new Date(now - 4 * day);
            return [
              {
                status: ApplicationStatus.APPLIED,
                date: new Date(now - 18 * day),
                notes: 'Initial application submitted.',
              },
              {
                status: ApplicationStatus.INTERVIEW,
                date: firstInterviewDate,
                notes: 'First interview: frontend and UX collaboration.',
              },
              {
                status: ApplicationStatus.INTERVIEW,
                date: secondInterviewDate,
                notes: 'Second interview: backend and scaling.',
              },
            ];
          })(),
        },
        interviews: {
          create: (() => {
            const secondInterviewDate = new Date(now - 4 * day);
            return {
              date: secondInterviewDate,
              notes: 'Second round: deeper technical assessment.',
              status: InterviewStatus.DONE,
            };
          })(),
        },
        reminders: {
          create: {
            alarmDate: new Date(now - 2 * day),
            message: 'Prepare questions about team structure (Senior Fullstack).',
            status: ReminderStatus.DONE,
          },
        },
      },
    }),

    // 13 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'Platform Engineer',
        companyId: company1.id,
        userId: user.id,
        jobLink: 'www.testsite13.com',
        jobDescription: 'Building internal developer platforms and tooling.',
        status: 'APPLIED',
        priority: 2,
        workLocation: 'HYBRID',
        notes: 'Interesting internal platform roadmap.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 9 * day),
              notes: 'Application submitted with platform case study.',
            },
            {
              status: ApplicationStatus.REJECTED,
              date: new Date(now - 3 * day),
            },
          ],
        },
      },
    }),

    // 14 - APPLIED
    prisma.application.create({
      data: {
        jobTitle: 'Security Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite14.com',
        jobDescription: 'Application security and threat modeling.',
        status: 'APPLIED',
        priority: 3,
        workLocation: 'REMOTE',
        notes: 'Security-focused, might require relocation later.',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(now - 13 * day),
              notes: 'Sent security-focused CV.',
            },
          ],
        },
      },
    }),

    // 15 - INTERVIEW (FIRST)
    prisma.application.create({
      data: {
        jobTitle: 'Cloud Architect',
        companyId: company1.id,
        userId: user.id,
        jobLink: 'www.testsite15.com',
        jobDescription: 'Cloud architecture and cost optimization.',
        status: 'INTERVIEW',
        priority: 1,
        workLocation: 'REMOTE',
        notes: 'Senior-level position with high responsibility.',
        favorited: true,
        fileUrls: [],
        logItems: {
          create: (() => {
            const interviewDate = new Date(now - 6 * day);
            return [
              {
                status: ApplicationStatus.APPLIED,
                date: new Date(now - 16 * day),
                notes: 'Initial application submitted.',
              },
              {
                status: ApplicationStatus.INTERVIEW,
                date: interviewDate,
                notes: 'First interview: cloud strategy and past projects.',
              },
            ];
          })(),
        },
        interviews: {
          create: (() => {
            const interviewDate = new Date(now - 6 * day);
            return {
              date: interviewDate,
              notes: 'First round: high-level architecture discussion.',
              status: InterviewStatus.DONE,
            };
          })(),
        },
        reminders: {
          create: {
            alarmDate: new Date(now + 180 * day),
            message: 'Prepare architecture diagrams to showcase in next round.',
          },
        },
      },
    }),
  ]);

  console.log(`Seeded ${applications.length} applications for user ${user.username}`);
}

export { main };

// Auto-execute when run directly (Prisma seed, ts-node, etc.)
// Only skip execution if explicitly imported as a module (not via CLI)
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
