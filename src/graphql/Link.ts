import { Prisma } from '@prisma/client';
import {
  arg,
  enumType,
  extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg,
} from 'nexus';

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('description');
    t.nonNull.string('url');
    t.nonNull.dateTime('createdAt');
    t.field('postedBy', {
      type: 'User',
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field('voters', {
      type: 'User',
      resolve(parent, args, context) {
        return context.prisma.link.findUnique({
          where: { id: parent.id },
        }).voters();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('feed', {
      type: 'Feed',
      args: {
        filter: stringArg(),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({ type: list(nonNull('LinkOrderByInput')) }),
      },
      async resolve(parent, args, context) {
        const {
          filter, skip, take, orderBy,
        } = args;

        const where = filter ? {
          OR: [
            { description: { contains: filter } },
            { url: { contains: filter } },
          ],
        } : {};

        const links = context.prisma.link.findMany({
          where,
          skip: skip as (number | undefined),
          take: take as (number | undefined),
          orderBy: orderBy as (Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined),
        });

        const count = await context.prisma.link.count({ where });

        return { links, count };
      },
    });
  },
});

export const LinkMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('post', {
      type: 'Link',
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve(parent, args, context) {
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {
          throw new Error('Cannot post without logging in.');
        }

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: { id: userId } },
          },
        });

        return newLink;
      },
    });
  },
});

export const LinkOrderByInput = inputObjectType({
  name: 'LinkOrderByInput',
  definition(t) {
    t.field('description', { type: 'Sort' });
    t.field('url', { type: 'Sort' });
    t.field('createdAt', { type: 'Sort' });
  },
});

export const Sort = enumType({
  name: 'Sort',
  members: ['asc', 'desc'],
});

export const Feed = objectType({
  name: 'Feed',
  definition(t) {
    t.nonNull.list.nonNull.field('links', { type: 'Link' });
    // t.nonNull.field('count', { type: 'Int' });
    t.nonNull.int('count');
  },
});

export default {};
