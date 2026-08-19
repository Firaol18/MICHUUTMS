import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repoMock: any;

  beforeEach(async () => {
    repoMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsersPaginated', () => {
    it('should return a paginated list of users', async () => {
      const mockUsers = [{ id: 1, name: 'Alice' }];
      const totalCount = 1;
      repoMock.findAndCount.mockResolvedValue([mockUsers, totalCount]);

      const result = await service.getUsersPaginated(1, 10);

      expect(repoMock.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { id: 'ASC' },
      });
      expect(result).toEqual({
        data: mockUsers,
        meta: {
          total: totalCount,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should return a filtered paginated list of users with search and isActive', async () => {
      const mockUsers = [{ id: 1, name: 'Alice', email: 'alice@example.com', isActive: true }];
      const totalCount = 1;
      repoMock.findAndCount.mockResolvedValue([mockUsers, totalCount]);

      const result = await service.getUsersPaginated(2, 5, 'Alice', true);

      expect(repoMock.findAndCount).toHaveBeenCalledWith({
        where: [
          { isActive: true, name: expect.anything() },
          { isActive: true, email: expect.anything() },
        ],
        skip: 5,
        take: 5,
        order: { id: 'ASC' },
      });
      expect(result).toEqual({
        data: mockUsers,
        meta: {
          total: totalCount,
          page: 2,
          limit: 5,
          totalPages: 1,
        },
      });
    });
  });
});
