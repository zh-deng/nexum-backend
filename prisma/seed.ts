import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
      city: 'Berlin',
      country: 'Germany',
      industry: 'Tech',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Globex Inc',
      city: 'Munich',
      country: 'Germany',
      industry: 'Finance',
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'Initech',
      city: 'Hamburg',
      country: 'Germany',
      industry: 'Software',
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
        priority: 'HIGH',
        workLocation: 'REMOTE',
        notes: 'Applied via LinkedIn',
        fileUrls: [],
        logItems: {
          create: {
            status: 'APPLIED',
            notes: 'Initial application sent',
          },
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
        priority: 'MEDIUM',
        workLocation: 'HYBRID',
        notes: 'Recruiter reached out',
        fileUrls: [],
        logItems: {
          create: {
            status: 'INTERVIEW',
            notes: 'Interview scheduled',
          },
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
        priority: 'LOW',
        workLocation: 'ON_SITE',
        notes: 'Still researching company',
        fileUrls: [],
        logItems: {
          create: {
            status: 'DRAFT',
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
