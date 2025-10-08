import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // TODO: Add authentication when implemented
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();

    // Search Projects
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ],
      },
      include: {
        client: {
          select: { name: true },
        },
      },
      take: 10,
    });

    // Search Tasks
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ],
      },
      include: {
        project: {
          select: { name: true },
        },
      },
      take: 10,
    });

    // Search Clients
    const clients = await prisma.client.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: searchTerm } },
          { company: { contains: searchTerm } },
          { email: { contains: searchTerm } },
        ],
      },
      take: 10,
    });

    // Search Notes
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
        ],
      },
      include: {
        project: {
          select: { name: true },
        },
      },
      take: 10,
    });

    // Transform results
    const results = [
      ...projects.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        subtitle: p.client?.name || 'Kein Kunde',
        status: p.status,
        metadata: { clientName: p.client?.name },
      })),
      ...tasks.map((t) => ({
        id: t.id,
        type: 'task' as const,
        title: t.title,
        subtitle: t.project?.name || 'Kein Projekt',
        status: t.status,
        metadata: { projectName: t.project?.name },
      })),
      ...clients.map((c) => ({
        id: c.id,
        type: 'client' as const,
        title: c.name,
        subtitle: c.company || c.email,
        status: c.status,
        metadata: { company: c.company, email: c.email },
      })),
      ...notes.map((n) => ({
        id: n.id,
        type: 'note' as const,
        title: n.title,
        subtitle: n.project?.name || 'Kein Projekt',
        metadata: { projectId: n.projectId, projectName: n.project?.name },
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
