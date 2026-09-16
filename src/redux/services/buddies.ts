import { api } from './index';
import type {
  BuddiesResponse,
  BuddyInviteAction,
  BuddyInvitesResponse,
  InviteBuddyBody,
  InviteBuddyResponse,
  RespondToInviteResponse,
} from '../types';

/**
 * Two sides of one relationship. `/v1/buddies` is the OWNER's view (people I
 * nominated to receive my theft alerts); `/v1/buddy-invites` is the BUDDY's
 * view (people who nominated me, awaiting my in-app answer). Consent is only
 * ever given in-app, so there is no emailed accept link to handle here.
 */
const injectedEndpoints = api.injectEndpoints({
  endpoints: build => ({
    // --- owner side ---------------------------------------------------------

    buddies: build.query<BuddiesResponse, void>({
      query: () => 'v1/buddies',
      providesTags: ['Buddies'],
    }),

    /**
     * Nominates by email. Re-inviting a declined/revoked address reuses the
     * same link, so the list never grows a duplicate row. Rate limited server
     * side (5/hour) because every call emails someone.
     */
    inviteBuddy: build.mutation<InviteBuddyResponse, { body: InviteBuddyBody }>(
      {
        query: ({ body }) => ({
          url: 'v1/buddies',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['Buddies'],
      },
    ),

    /** Soft delete: the link stays in the list as 'revoked'. */
    removeBuddy: build.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `v1/buddies/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Buddies'],
    }),

    // --- buddy side ---------------------------------------------------------

    /** Only pending invitations; answered ones drop out of this list. */
    buddyInvites: build.query<BuddyInvitesResponse, void>({
      query: () => 'v1/buddy-invites',
      providesTags: ['BuddyInvites'],
    }),

    respondToInvite: build.mutation<
      RespondToInviteResponse,
      { id: string; action: BuddyInviteAction }
    >({
      query: ({ id, action }) => ({
        url: `v1/buddy-invites/${id}/${action}`,
        method: 'POST',
      }),
      invalidatesTags: ['BuddyInvites'],
    }),
  }),
});

export const {
  useBuddiesQuery,
  useInviteBuddyMutation,
  useRemoveBuddyMutation,
  useBuddyInvitesQuery,
  useRespondToInviteMutation,
} = injectedEndpoints;
