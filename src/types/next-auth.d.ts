import { DefaultSession } from 'next-auth';
import { Role, Track } from '@prisma/client';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: Role;
            activeTrack: Track;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        role: Role;
        activeTrack: Track;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: Role;
        activeTrack: Track;
    }
}
