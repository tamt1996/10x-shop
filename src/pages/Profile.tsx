
import { useState, type ChangeEvent, type FormEvent } from 'react'

interface ProfileData {
  fullName: string
  email: string
  phone: string
  address: string
}

interface LoggedInUser {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
}

const defaultProfile: ProfileData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
}

function getInitialProfile(): ProfileData {
  try {
    const savedProfile = localStorage.getItem('shop_profile')
    const savedUser = localStorage.getItem('shop_user')

    const profile: ProfileData = savedProfile
      ? { ...defaultProfile, ...JSON.parse(savedProfile) }
      : { ...defaultProfile }

    if (savedUser) {
      const user = JSON.parse(savedUser) as LoggedInUser

      if (!profile.fullName) {
        profile.fullName =
          `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
          user.username ||
          ''
      }

      if (!profile.email) {
        profile.email = user.email ?? ''
      }
    }

    return profile
  } catch {
    return { ...defaultProfile }
  }
}

function Profile() {
  const [profile, setProfile] = useState<ProfileData>(getInitialProfile)
  const [message, setMessage] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))

    setMessage('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    localStorage.setItem('shop_profile', JSON.stringify(profile))
    setMessage('Profile saved successfully!')
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">
        My Profile
      </h1>

      <p className="mt-2 text-gray-600">
        View and update your personal information.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={profile.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Save Changes
        </button>

        {message && (
          <p role="status" className="text-center text-sm text-green-600">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}

export default Profile
