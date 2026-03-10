/**
 * ============================================================================
 * TEAM MEMBER DOMAIN ENTITY
 * ============================================================================
 * Pure domain entity with business rules
 */

export interface TeamMemberProps {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
  image?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TeamMember domain entity
 * Contains business logic and validation
 */
export class TeamMember {
  constructor(private props: TeamMemberProps) {}

  // Getters
  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get role(): string { return this.props.role; }
  get department(): string { return this.props.department; }
  get description(): string { return this.props.description; }
  get image(): string | null | undefined { return this.props.image; }
  get order(): number { return this.props.order; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Update team member data
   */
  update(data: Partial<Omit<TeamMemberProps, 'id' | 'createdAt' | 'updatedAt'>>): void {
    if (data.name) this.props.name = data.name;
    if (data.role) this.props.role = data.role;
    if (data.department) this.props.department = data.department;
    if (data.description) this.props.description = data.description;
    if (data.image !== undefined) this.props.image = data.image;
    if (data.order !== undefined) this.props.order = data.order;
    if (data.isActive !== undefined) this.props.isActive = data.isActive;
    
    this.props.updatedAt = new Date();
  }

  /**
   * Activate team member
   */
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivate team member
   */
  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Update order
   */
  setOrder(order: number): void {
    this.props.order = order;
    this.props.updatedAt = new Date();
  }

  /**
   * Convert to plain object
   */
  toJSON(): TeamMemberProps {
    return { ...this.props };
  }

  /**
   * Create new team member
   */
  static create(data: Omit<TeamMemberProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): TeamMember {
    const now = new Date();
    return new TeamMember({
      id: data.id || generateId(),
      name: data.name,
      role: data.role,
      department: data.department,
      description: data.description,
      image: data.image,
      order: data.order,
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `tm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default TeamMember;
