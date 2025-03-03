
const generateUserBgColor = (identifier: string) => {
    if (!identifier) return 'bg-gray-500';

    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500',
        'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ]
    const hash = identifier.split('').reduce((acc, cur) =>{
        return acc + cur.charCodeAt(0);
    },0);

    return colors[hash % colors.length]
}

const userDisplayName = (user:any) => {
    let displayName = 'User';
    if (user?.displayName) {
      displayName = user.displayName.split(' ')[0];
    } else if (user?.email) {
      displayName = user.email.split('@')[0];
    }
    return displayName;
}
export {generateUserBgColor, userDisplayName}