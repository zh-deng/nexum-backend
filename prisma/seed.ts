import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ApplicationStatus } from '../src/types/enums';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const hashedPassword = await bcrypt.hash('password', 10);

  const user = await prisma.user.create({
    data: {
      email: 'test@web.de',
      username: 'mark',
      password: hashedPassword,
    },
  });

  const company1 = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      website: 'https://www.acmecorp.com',
      street: 'romanstreet 22',
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
      street: 'wolfstreet 4',
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
      street: 'mainstreet 645',
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
    prisma.application.create({
      data: {
        jobTitle: 'Frontend Developer',
        companyId: company1.id,
        userId: user.id,
        jobLink: 'www.testsite1.com',
        jobDescription: 'jobDescription1',
        status: 'APPLIED',
        priority: 1,
        workLocation: 'REMOTE',
        notes: 'Applied via LinkedIn',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              notes: 'Initial application sent',
            },
            {
              status: ApplicationStatus.INTERVIEW,
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              notes: 'First phone interview finished',
            },
          ],
        },
        reminders: {
          create: {
            alarmDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            message: 'Follow up with recruiter',
          },
        },
        interviews: {
          create: {
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            notes: 'Zoom interview scheduled',
          },
        },
      },
    }),
    prisma.application.create({
      data: {
        jobTitle: 'Backend Engineer',
        companyId: company2.id,
        userId: user.id,
        jobLink: 'www.testsite2.com',
        jobDescription: 'jobDescription2',
        status: 'INTERVIEW',
        priority: 2,
        workLocation: 'HYBRID',
        notes: 'Recruiter reached out',
        favorited: true,
        fileUrls: [],
        logItems: {
          create: [
            {
              status: ApplicationStatus.APPLIED,
              date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              notes: 'Initial application sent',
            },
            {
              status: ApplicationStatus.INTERVIEW,
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              notes: 'First phone interview finished',
            },
          ],
        },
        reminders: {
          create: {
            alarmDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            message: 'Prepare for interview',
          },
        },
        interviews: {
          create: {
            date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            notes: 'On-site interview',
          },
        },
      },
    }),
    prisma.application.create({
      data: {
        jobTitle: 'DevOps Specialist',
        companyId: company3.id,
        userId: user.id,
        jobLink: 'www.testsite3.com',
        jobDescription: 'jobDescription3',
        status: 'DRAFT',
        priority: 3,
        workLocation: 'ON_SITE',
        notes: 'Still researching company',
        favorited: false,
        fileUrls: [],
        logItems: {
          create: {
            status: ApplicationStatus.DRAFT,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            notes: 'Draft created',
          },
        },
        reminders: {
          create: {
            alarmDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            message: 'Decide whether to apply',
          },
        },
        interviews: {
          create: {
            date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            notes: 'No interview scheduled yet',
          },
        },
      },
    }),
  ]);

  console.log(`Seeded ${applications.length} applications for user ${user.username}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
