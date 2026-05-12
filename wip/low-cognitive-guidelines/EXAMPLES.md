# Low Cognitive Guidelines — Examples

Each principle shown with varied real-world code. Framework used as context illustration only — the principle is universal.

---

## 1. Deep Modules

```typescript
// ✅ Caller sees one clean interface — complexity hidden inside
// e.g. any service layer:
await userService.create(dto);

// What happens inside (caller doesn't care):
async create(dto: CreateUserDto): Promise<User> {
  await this.assertEmailUnique(dto.email);
  const hashed = await this.hashPassword(dto.password);
  const user = await this.repo.save({ ...dto, password: hashed });
  this.events.emit('user.created', user);
  await this.mailer.sendWelcome(user.email);
  return user;
}

// ✅ Same principle in a React hook:
const { user, login, logout, isLoading } = useAuth();
// One call. Token storage, session refresh, context updates — all hidden.

// ❌ Caller assembles every step — any change to internals breaks all callers
const hashed = await bcrypt.hash(dto.password, 10);
await validateEmailUnique(dto.email, repo);
const user = await repo.save({ ...dto, password: hashed });
await mailer.send({ to: user.email, template: 'welcome' });
events.emit('user.created', user.id);
```

---

## 2. Strong Typing

```typescript
// ✅ Branded primitives — compiler catches wrong ID passed to wrong fn
type UserId  = string & { __brand: 'UserId' };
type OrderId = string & { __brand: 'OrderId' };

function getUser(id: UserId): Promise<User> { ... }
function getOrder(id: OrderId): Promise<Order> { ... }
// getUser(orderId) → compile error. No runtime mystery.

// ✅ Explicit union — no valid values to guess (e.g. component props, DTO enums)
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type UserRole      = 'admin' | 'editor' | 'viewer';

// ❌ Loose types — AI and humans both guess what's acceptable
function getUser(id: string) { ... }             // which string? UUID? slug?
const Button = (props: any) => { ... }           // variant can be anything
async createUser(@Body() body: object) { ... }   // what fields? what formats?
```

---

## 3. Consistency

```typescript
// ✅ One return contract across all operations — no per-fn reading needed
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async findUser(id: string): Promise<Result<User>>   { ... }
async createUser(dto: CreateUserDto): Promise<Result<User>> { ... }
async deleteUser(id: string): Promise<Result<void>> { ... }
// Caller always knows: check .ok, then .data or .error.

// ✅ Same principle for query hooks — identical shape every time:
const { data: user,     isLoading, error } = useUser(id);
const { data: orders,   isLoading, error } = useOrders(userId);
const { data: settings, isLoading, error } = useSettings();

// ❌ Mixed conventions — every fn is a new surprise
async findUser(id: string): Promise<User | null>   { ... }  // returns null
async createUser(dto: CreateUserDto): Promise<User> { ... }  // throws on error
async deleteUser(id: string): Promise<boolean>      { ... }  // true/false?
const { user, loading }        = useUser(id);    // 'loading' not 'isLoading'
const { posts, fetching, err } = usePosts(id);   // 'fetching', 'err'
```

---

## 4. SRP (Single Responsibility)

```typescript
// ✅ Each unit has exactly one reason to change
// parser.ts     — transforms raw input to domain objects
// validator.ts  — enforces domain rules
// repository.ts — handles persistence
// notifier.ts   — handles outbound communication

// e.g. in a layered backend:
@Controller('users')   // HTTP mapping only
class UserController { @Post() create(@Body() dto) { return this.svc.create(dto); } }

@Injectable()          // business rules only
class UserService      { async create(dto) { ... } }

@Injectable()          // DB access only
class UserRepository   { async save(user) { ... } }

// ✅ Same principle for frontend — hook fetches, component renders:
function useUser(id: string) {
  return useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });
}
function UserCard({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId);
  if (isLoading) return <Skeleton />;
  return <div>{user.name}</div>;
}

// ❌ One unit doing everything — any change touches unrelated logic
class UserController {
  async create(body: any) {
    const exists = await db.query(`SELECT 1 FROM users WHERE email = $1`, [body.email]);
    if (exists.rows.length) throw new Error('exists');
    const hashed = await bcrypt.hash(body.password, 10);
    const user = await db.query(`INSERT INTO users ...`);
    await smtp.send({ to: body.email, subject: 'Welcome' });
    return user.rows[0];
  }
}
```

---

## 5. Pure Functions

```typescript
// ✅ Same input → same output, no external dependencies, no side effects
function calculateOrderTotal(items: OrderItem[], discountPct = 0): number {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return subtotal * (1 - discountPct / 100);
}
// Unit test needs zero mocks. Reason about it in isolation.

// ✅ Pure selector (works in Redux, Zustand, any state manager):
function selectActiveAdmins(users: User[]): User[] {
  return users.filter((u) => u.status === "active" && u.role === "admin");
}

// ❌ Impure — hidden dependencies make behavior unpredictable and untestable
function calculateOrderTotal(orderId: string): Promise<number> {
  const order = await this.repo.findById(orderId); // DB dependency — needs mock
  this.logger.log("calculating"); // side effect
  this.cache.set(orderId, total); // mutation
  return total;
}
function getActiveAdmins(): User[] {
  const users = globalStore.getState().users; // depends on external state
  analytics.track("admins_queried"); // side effect not visible in signature
  return users.filter((u) => u.role === "admin");
}
```

---

## 6. Fail-Fast

```typescript
// ✅ Validate at entry — errors surface at the source, not 3 layers deep
function divide(a: number, b: number): number {
  if (b === 0) throw new RangeError(`divide: b must not be 0`);
  return a / b;
}

// ✅ Service layer — throw specific typed errors immediately
async assignRole(userId: string, role: UserRole): Promise<User> {
  if (!userId) throw new BadRequestException('userId is required');
  const user = await this.repo.findById(userId);
  if (!user)         throw new NotFoundException(`User ${userId} not found`);
  if (user.deletedAt) throw new ConflictException(`User ${userId} is deleted`);
  return this.repo.update(userId, { role });
}

// ✅ Hook — misuse caught at call site, not inside query internals
function useUser(userId: string) {
  if (!userId) throw new Error(`useUser requires userId, got: ${JSON.stringify(userId)}`);
  return useQuery({ queryKey: ['user', userId], queryFn: () => fetchUser(userId) });
}

// ❌ Silent — error propagates silently through layers
async assignRole(userId: string, role: UserRole) {
  const user = await this.repo.findById(userId); // user might be null
  return this.repo.update(user?.id, { role });   // TypeError: Cannot read 'id' of null
}
function useUser(userId: string) {
  return useQuery({ queryFn: () => userId ? fetchUser(userId) : null }); // silent no-op
}
```

---

## 7. Rule of 100

```typescript
// ✅ Each function ≤ 100 lines, single named purpose
async function importUsers(csvPath: string): Promise<ImportResult> {
  const rows    = await readCSVFile(csvPath);
  const results = await Promise.all(rows.map(processRow));
  return summarizeResults(results);
}
async function processRow(raw: string): Promise<RowResult> {
  const fields     = parseCSVRow(raw);
  const validation = validateUserFields(fields);
  if (!validation.ok) return { error: validation.error };
  return userService.create(toCreateUserDto(fields));
}

// ✅ Same principle for components — extract when it needs a comment
function UserList({ users }: { users: User[] }) {
  if (!users.length) return <EmptyState />;
  return <ul>{users.map(u => <UserListItem key={u.id} user={u} />)}</ul>;
}
// UserListItem is its own short component — not inline JSX block

// ❌ One function doing everything — impossible to hold in working memory
async function importUsers(csvPath: string) {
  const fs = require('fs');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  const results = [];
  for (const line of lines) {
    const [name, email, role] = line.split(',').map(s => s.trim());
    if (!email.includes('@')) { results.push({ error: 'bad email' }); continue; }
    if (!['admin','user'].includes(role)) { results.push({ error: 'bad role' }); continue; }
    // ... 80 more lines
  }
}
```

---

## 8. Declarative Code

```typescript
// ✅ Reads like a description of the outcome
const activeAdminEmails = users
  .filter(u => u.status === 'active')
  .filter(u => u.role === 'admin')
  .map(u => u.email);

// ✅ Decorator-based routing (NestJS) — intent declared, not wired manually
@Get(':id')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard)
findOne(@Param('id') id: string) { return this.svc.findById(id); }

// ✅ JSX (React) — UI described, not constructed
function UserGrid({ users }: { users: User[] }) {
  return <Grid>{users.map(u => <UserCard key={u.id} user={u} />)}</Grid>;
}

// ❌ Imperative — trace line by line to understand what it produces
const activeAdminEmails: string[] = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].status === 'active' && users[i].role === 'admin') {
    activeAdminEmails.push(users[i].email);
  }
}
// ❌ Manual wiring in route handler
async findOne(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, secret);
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  res.json(await this.svc.findById(req.params.id));
}
```

---

## 9. Data / Logic Split

```typescript
// ✅ types.ts — shapes only, zero behavior
export interface User   { id: string; email: string; role: UserRole; createdAt: Date; }
export interface CreateUserInput { email: string; password: string; role?: UserRole; }

// ✅ user-service.ts — behavior only, imports types
import type { User, CreateUserInput } from './types';
export async function createUser(input: CreateUserInput): Promise<User> { ... }

// ✅ DTO as data contract — class-validator decorators are metadata, not logic
export class CreateUserDto {
  @IsEmail()   email: string;
  @MinLength(8) password: string;
}
// UserService imports and uses CreateUserDto — it doesn't define types inline

// ✅ React: types.ts for shapes, hooks for logic
// types.ts:
export interface UserFilters { status?: 'active' | 'inactive'; role?: UserRole; }
// useUsers.ts:
export function useUsers(filters: UserFilters) { return useQuery(...); }

// ❌ Data + logic + validation + serialization mixed in one class
class User {
  id: string; email: string;          // data
  validate() { ... }                   // logic
  toJSON() { ... }                     // serialization
  async save() { ... }                 // DB concern
  static fromRow(row: any) { ... }     // transformation
}
```

---

## 10. Law of Demeter

```typescript
// ✅ Pass exactly what's needed — fn doesn't navigate caller's object graph
function sendWelcomeEmail(email: string, firstName: string): void { ... }
sendWelcomeEmail(user.email, user.firstName);

// ✅ Component receives primitives — not the entire parent model
<Avatar imageUrl={user.profile.avatarUrl} name={user.name} size="md" />
// Avatar has no knowledge of User shape — change User, Avatar stays stable

// ✅ Inject specific dependency — not a module/container to fish from
class OrderService {
  constructor(
    private userService: UserService,
    private productService: ProductService,
  ) {}
}

// ❌ Fn receives whole object but uses 2 fields — coupled to entire shape
function sendWelcomeEmail(user: User): void {
  const email = user.contact.primary.email;     // deep chain
  const name  = user.profile.personal.firstName; // deep chain
}
// ❌ Component drills through parent's internals
<Avatar user={user} />
// Inside: user.profile.avatarUrl · user.settings.avatarSize · user.name

// ❌ Inject module graph — hides real dependencies, tests become hard
class OrderService {
  constructor(private moduleRef: ModuleRef) {}
  async doWork() {
    const svc = this.moduleRef.get(UserService); // implicit dependency
  }
}
```
